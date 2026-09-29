-- ============================================================
--  SQL COMPLETO PARA CRIAR O BANCO DE DADOS - COLUPE
--  Marketplace de Serviços (Estilo GetNinjas) + Snowflake ID
-- ============================================================

-- ============================================================
--  Extensões
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
--  ENUMs
-- ============================================================

DO $$ BEGIN
    CREATE TYPE otp_type AS ENUM ('registration', 'password_reset');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'professional', 'client');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE professional_status AS ENUM ('pending', 'verified', 'rejected', 'suspended');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled', 'expired');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE lead_unlock_status AS ENUM ('unlocked', 'contacted', 'hired', 'declined');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('purchase', 'lead_unlock', 'refund', 'bonus', 'admin_adjustment');
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- ============================================================
--  Snowflake ID Generator — Pure PostgreSQL (PL/pgSQL)
-- ============================================================
--
--  Bit layout (52 bits — seguro para JS Number.MAX_SAFE_INTEGER):
--  ┌───────────────────┬──────────────┬──────────────────┐
--  │ 41 bits timestamp │ 4 bits wkr   │ 7 bits sequence  │
--  └───────────────────┴──────────────┴──────────────────┘
--
--  Epoch  : 2026-01-01 00:00:00 UTC  (1767225600000 ms, ~69.7 anos)
--  Coluna : BIGINT  (máx ~4.5 × 10^15, cabe no safe integer JS)
--
--  Uso:
--    SELECT generate_snowflake_id();       -- worker 1 (padrão)
--    SELECT generate_snowflake_id(3);      -- worker explícito (0-15)
--    SELECT * FROM decode_snowflake_id(id);-- inspecionar qualquer id
-- ============================================================

CREATE TABLE IF NOT EXISTS snowflake_state (
    worker_id   INT      PRIMARY KEY
                         CHECK (worker_id BETWEEN 0 AND 15),
    last_ms     BIGINT   NOT NULL DEFAULT 0,
    sequence    INT      NOT NULL DEFAULT -1
                         CHECK (sequence BETWEEN -1 AND 127)
);

COMMENT ON TABLE  snowflake_state           IS 'Estado persistente da geração de Snowflake ID (uma linha por worker).';
COMMENT ON COLUMN snowflake_state.worker_id IS 'Identificador do nó (0–15).';
COMMENT ON COLUMN snowflake_state.last_ms   IS 'Último timestamp (ms) em que um Snowflake foi emitido.';
COMMENT ON COLUMN snowflake_state.sequence  IS 'Contador sequencial no mesmo milissegundo (−1 = nunca usado).';

-- Seed do worker 1 como nó padrão
INSERT INTO snowflake_state (worker_id, last_ms, sequence)
VALUES (1, 0, -1)
ON CONFLICT DO NOTHING;


CREATE OR REPLACE FUNCTION generate_snowflake_id(
    p_worker_id INT DEFAULT 1
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    c_epoch    CONSTANT BIGINT := 1767225600000;  -- 2026-01-01 00:00:00 UTC
    c_max_seq  CONSTANT INT    := 127;            -- 2^7 − 1 (128 IDs/ms por worker)
    c_max_wkr  CONSTANT INT    := 15;             -- 2^4 − 1 (Até 16 workers: 0 a 15)

    v_now_ms   BIGINT;
    v_last_ms  BIGINT;
    v_seq      INT;
BEGIN
    IF p_worker_id < 0 OR p_worker_id > c_max_wkr THEN
        RAISE EXCEPTION 'worker_id deve estar entre 0 e %, recebido: %', c_max_wkr, p_worker_id;
    END IF;

    INSERT INTO snowflake_state (worker_id, last_ms, sequence)
    VALUES (p_worker_id, 0, -1)
    ON CONFLICT (worker_id) DO NOTHING;

    SELECT last_ms, sequence
      INTO v_last_ms, v_seq
      FROM snowflake_state
     WHERE worker_id = p_worker_id
       FOR UPDATE;

    v_now_ms := FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT;

    IF v_now_ms < v_last_ms THEN
        RAISE EXCEPTION 'Relógio voltou % ms — geração de ID recusada.', (v_last_ms - v_now_ms);
    END IF;

    IF v_now_ms = v_last_ms THEN
        v_seq := v_seq + 1;
        IF v_seq > c_max_seq THEN
            LOOP
                PERFORM pg_sleep(0.001);
                v_now_ms := FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT;
                EXIT WHEN v_now_ms > v_last_ms;
            END LOOP;
            v_seq := 0;
        END IF;
    ELSE
        v_seq := 0;
    END IF;

    UPDATE snowflake_state
       SET last_ms  = v_now_ms,
           sequence = v_seq
     WHERE worker_id = p_worker_id;

    RETURN ((v_now_ms - c_epoch) << 11)
        |  (p_worker_id::BIGINT  << 7)
        |   v_seq::BIGINT;
END;
$$;

CREATE OR REPLACE FUNCTION decode_snowflake_id(p_id BIGINT)
RETURNS TABLE (
    snowflake_id  BIGINT,
    generated_at  TIMESTAMPTZ,
    worker_id     INT,
    sequence      INT
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        p_id                                                             AS snowflake_id,
        TO_TIMESTAMP((p_id >> 11) / 1000.0 + 1767225600)               AS generated_at,
        ((p_id >> 7) & 15)::INT                                         AS worker_id,
        ( p_id       & 127)::INT                                        AS sequence;
$$;

CREATE OR REPLACE FUNCTION snowflake_id()
RETURNS BIGINT
LANGUAGE sql
AS $$
    SELECT generate_snowflake_id(1);
$$;


-- ============================================================
--  TABELA: keep_alive
-- ============================================================

CREATE TABLE IF NOT EXISTS keep_alive (
    id         BIGSERIAL    PRIMARY KEY,
    created_at TIMESTAMPTZ  DEFAULT NOW()
);


-- ============================================================
--  TABELA: profiles (Usuários Base do Sistema)
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
    id                   BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
    email                TEXT         NOT NULL UNIQUE,
    password_hash        TEXT         NOT NULL,
    full_name            TEXT         NOT NULL,
    phone                TEXT,
    avatar_url           TEXT,
    is_verified          BOOLEAN      NOT NULL DEFAULT false,
    role                 TEXT         NOT NULL DEFAULT 'client', -- 'admin', 'professional', 'client'
    must_change_password BOOLEAN      NOT NULL DEFAULT false,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at           TIMESTAMPTZ
);

-- Seed Admin Padrão
INSERT INTO profiles (email, password_hash, full_name, is_verified, role)
VALUES (
    'luizkrx@gmail.com',
    '$argon2id$v=19$m=65536,t=2,p=1$aBjdgDHKifJd2cOOXB1b8PTM9uDLo59RBeGsptR6MMs$Mbzp3knjIpProvL19LTJj0qi4udF7fAYwhb909qhEEM',
    'Luiz Carlos',
    true,
    'admin'
)
ON CONFLICT (email) DO UPDATE 
SET role = 'admin',
    is_verified = true,
    password_hash = EXCLUDED.password_hash;


-- ============================================================
--  TABELAS DE CATEGORIAS E SERVIÇOS
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
    id          BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
    slug        TEXT         NOT NULL UNIQUE,
    name        TEXT         NOT NULL,
    description TEXT,
    icon        TEXT,        -- Nome do ícone Lucide / SVG
    image_url   TEXT,
    is_active   BOOLEAN      NOT NULL DEFAULT true,
    order_index INT          NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
    id                BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
    category_id       BIGINT       NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    slug              TEXT         NOT NULL UNIQUE,
    name              TEXT         NOT NULL,
    description       TEXT,
    icon              TEXT,
    lead_cost_credits INT          NOT NULL DEFAULT 10, -- Custo em moedas para o profissional desbloquear o lead
    form_schema       JSONB,       -- Perguntas e campos dinâmicos do formulário de solicitação
    is_active         BOOLEAN      NOT NULL DEFAULT true,
    order_index       INT          NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- ============================================================
--  TABELAS DE PROFISSIONAIS
-- ============================================================

CREATE TABLE IF NOT EXISTS professional_profiles (
    id                 BIGINT              PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    document_type      TEXT                NOT NULL DEFAULT 'CPF', -- 'CPF' ou 'CNPJ'
    document_number    TEXT                NOT NULL UNIQUE,
    company_name       TEXT,
    whatsapp           TEXT                NOT NULL,
    bio                TEXT,
    experience_years   INT                 DEFAULT 0,
    city               TEXT                NOT NULL,
    state              TEXT                NOT NULL,               -- UF ex: 'SC'
    neighborhood       TEXT,
    service_radius_km  INT                 NOT NULL DEFAULT 30,    -- Raio de atendimento em km
    status             professional_status NOT NULL DEFAULT 'pending',
    rejection_reason   TEXT,
    credits_balance    INT                 NOT NULL DEFAULT 20,    -- Saldo inicial de moedas/créditos (bônus de boas-vindas)
    rating_avg         NUMERIC(3, 2)       NOT NULL DEFAULT 0.00,  -- Média de avaliações (ex: 4.85)
    rating_count       INT                 NOT NULL DEFAULT 0,     -- Total de avaliações recebidas
    is_available       BOOLEAN             NOT NULL DEFAULT true,  -- Disponível para receber novos pedidos
    created_at         TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- Especialidades / Serviços que o profissional atende (N:N)
CREATE TABLE IF NOT EXISTS professional_services (
    professional_id BIGINT      NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
    service_id      BIGINT      NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (professional_id, service_id)
);

-- Portfólio de Fotos de Trabalhos Realizados
CREATE TABLE IF NOT EXISTS professional_portfolio (
    id              BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
    professional_id BIGINT       NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
    title           TEXT         NOT NULL,
    description     TEXT,
    image_url       TEXT         NOT NULL,
    order_index     INT          NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- ============================================================
--  TABELAS DE SOLICITAÇÕES DE SERVIÇOS (LEADS / PEDIDOS)
-- ============================================================

CREATE TABLE IF NOT EXISTS service_requests (
    id             BIGINT         PRIMARY KEY DEFAULT snowflake_id(),
    client_id      BIGINT         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    service_id     BIGINT         NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    title          TEXT           NOT NULL,
    description    TEXT           NOT NULL,
    answers_json   JSONB          NOT NULL DEFAULT '{}'::jsonb, -- Respostas do formulário dinâmico
    photos_urls    TEXT[]         DEFAULT ARRAY[]::TEXT[],      -- Fotos do local/objeto do serviço
    city           TEXT           NOT NULL,
    state          TEXT           NOT NULL,
    neighborhood   TEXT,
    address_masked TEXT,                                        -- Endereço mascarado (exibido antes do desbloqueio)
    address_full   TEXT           NOT NULL,                     -- Endereço completo (exibido apenas após desbloqueio)
    urgency        TEXT           NOT NULL DEFAULT 'medium',    -- 'immediate', 'this_week', 'flexible'
    budget_range   TEXT,                                        -- Orçamento estimado pelo cliente (opcional)
    max_unlocks    INT            NOT NULL DEFAULT 4,           -- Máximo de profissionais que podem desbloquear (padrão 4)
    unlocks_count  INT            NOT NULL DEFAULT 0,           -- Quantidade atual de desbloqueios
    status         request_status NOT NULL DEFAULT 'open',
    created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Desbloqueio de Contato do Pedido pelo Profissional
CREATE TABLE IF NOT EXISTS lead_unlocks (
    id              BIGINT             PRIMARY KEY DEFAULT snowflake_id(),
    request_id      BIGINT             NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    professional_id BIGINT             NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
    credits_spent   INT                NOT NULL,
    status          lead_unlock_status NOT NULL DEFAULT 'unlocked',
    notes           TEXT,                                          -- Anotações do profissional sobre a negociação
    unlocked_at     TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    UNIQUE (request_id, professional_id)
);


-- ============================================================
--  TABELA: reviews (Avaliações dos Clientes)
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
    id               BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
    request_id       BIGINT       NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    client_id        BIGINT       NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    professional_id  BIGINT       NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
    rating           INT          NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment          TEXT,
    response_comment TEXT,        -- Resposta pública do profissional à avaliação
    responded_at     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (request_id, professional_id)
);


-- ============================================================
--  TABELAS DE MOEDAS / CRÉDITOS & TRANSAÇÕES
-- ============================================================

CREATE TABLE IF NOT EXISTS credit_packages (
    id             BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
    name           TEXT         NOT NULL, -- Ex: "Pacote Iniciante", "Pacote Profissional"
    credits_amount INT          NOT NULL, -- Quantidade de moedas
    bonus_credits  INT          NOT NULL DEFAULT 0,
    price_cents    INT          NOT NULL, -- Valor em centavos (R$)
    is_active      BOOLEAN      NOT NULL DEFAULT true,
    order_index    INT          NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_transactions (
    id              BIGINT           PRIMARY KEY DEFAULT snowflake_id(),
    professional_id BIGINT           NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
    amount          INT              NOT NULL, -- Positivo para compra/bônus, negativo para consumo de lead
    balance_after   INT              NOT NULL, -- Saldo resultante
    type            transaction_type NOT NULL,
    description     TEXT             NOT NULL,
    reference_id    BIGINT,                    -- ID do lead_unlock ou do pacote
    created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);


-- ============================================================
--  TABELAS DE AUTENTICAÇÃO, TOKENS & AUDITORIA
-- ============================================================

CREATE TABLE IF NOT EXISTS otp_codes (
    id         BIGSERIAL    PRIMARY KEY,
    user_id    BIGINT       NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    code       TEXT         NOT NULL,
    type       otp_type     NOT NULL,
    expires_at TIMESTAMPTZ  NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id         BIGSERIAL    PRIMARY KEY,
    user_id    BIGINT       NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    token_hash TEXT         NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ  NOT NULL,
    is_revoked BOOLEAN      NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id         BIGSERIAL    PRIMARY KEY,
    user_id    BIGINT       REFERENCES profiles(id) ON DELETE SET NULL,
    action     TEXT         NOT NULL,
    source_app TEXT         NOT NULL DEFAULT 'colupe',
    ip_address TEXT,
    ip_port    INTEGER,
    user_agent TEXT,
    metadata   JSONB,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- ============================================================
--  TRIGGERS E FUNÇÕES AUTOMÁTICAS
-- ============================================================

-- 1. Trigger universal para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_professional_profiles_updated_at ON professional_profiles;
CREATE TRIGGER update_professional_profiles_updated_at BEFORE UPDATE ON professional_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_requests_updated_at ON service_requests;
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lead_unlocks_updated_at ON lead_unlocks;
CREATE TRIGGER update_lead_unlocks_updated_at BEFORE UPDATE ON lead_unlocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- 2. Trigger para recalcular média de notas e total de avaliações do profissional
CREATE OR REPLACE FUNCTION recalculate_professional_rating()
RETURNS TRIGGER AS $$
DECLARE
    v_prof_id BIGINT;
    v_avg NUMERIC(3, 2);
    v_count INT;
BEGIN
    v_prof_id := COALESCE(NEW.professional_id, OLD.professional_id);

    SELECT COALESCE(AVG(rating), 0)::NUMERIC(3, 2), COUNT(*)
      INTO v_avg, v_count
      FROM reviews
     WHERE professional_id = v_prof_id;

    UPDATE professional_profiles
       SET rating_avg = v_avg,
           rating_count = v_count
     WHERE id = v_prof_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_recalculate_rating ON reviews;
CREATE TRIGGER trigger_recalculate_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_professional_rating();


-- 3. Trigger para incrementar unlocks_count no service_request
CREATE OR REPLACE FUNCTION handle_lead_unlock_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE service_requests
       SET unlocks_count = unlocks_count + 1,
           status = CASE 
               WHEN unlocks_count + 1 >= max_unlocks THEN 'in_progress'::request_status 
               ELSE status 
           END
     WHERE id = NEW.request_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_lead_unlock_count ON lead_unlocks;
CREATE TRIGGER trigger_lead_unlock_count
    AFTER INSERT ON lead_unlocks
    FOR EACH ROW
    EXECUTE FUNCTION handle_lead_unlock_count();


-- ============================================================
--  SEEDS INICIAIS (Categorias e Serviços Populares)
-- ============================================================

INSERT INTO categories (id, slug, name, description, icon, order_index)
VALUES 
    (1001, 'reformas-reparos', 'Reformas e Reparos', 'Eletricistas, encanadores, pintores, pedreiros e marcenaria.', 'hammer', 1),
    (1002, 'assistencia-tecnica', 'Assistência Técnica', 'Conserto de celulares, computadores, eletrodomésticos e TV.', 'wrench', 2),
    (1003, 'servicos-domesticos', 'Serviços Domésticos', 'Diaristas, faxineiras, cozinheiras e passadeiras.', 'home', 3),
    (1004, 'aulas-consultoria', 'Aulas e Consultoria', 'Aulas particulares, idiomas, reforço escolar e consultorias.', 'book-open', 4),
    (1005, 'design-tecnologia', 'Design e Tecnologia', 'Criação de sites, logotipos, marketing e desenvolvimento.', 'laptop', 5),
    (1006, 'eventos-festas', 'Eventos e Festas', 'Buffet, fotografia, garçons, DJs e decoração.', 'party-popper', 6)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (id, category_id, slug, name, description, lead_cost_credits, order_index)
VALUES 
    (2001, 1001, 'eletricista', 'Eletricista', 'Instalação elétrica, troca de disjuntores, chuveiros e fiação.', 15, 1),
    (2002, 1001, 'encanador', 'Encanador', 'Desentupimento, vazamentos, troca de torneiras e encanamento.', 15, 2),
    (2003, 1001, 'pintor', 'Pintor Residencial e Comercial', 'Pintura interna, externa, texturas e acabamentos.', 12, 3),
    (2004, 1002, 'conserto-celular', 'Conserto de Smartphone', 'Troca de tela, bateria, conectores e software.', 10, 1),
    (2005, 1003, 'diarista', 'Diarista / Faxina', 'Limpeza residencial completa, pós-obra e comercial.', 10, 1),
    (2006, 1005, 'criacao-sites', 'Criação de Sites e Landing Pages', 'Desenvolvimento de sites modernos e responsivos.', 20, 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO credit_packages (id, name, credits_amount, bonus_credits, price_cents, order_index)
VALUES
    (3001, 'Pacote Básico', 50, 0, 4990, 1),      -- R$ 49,90
    (3002, 'Pacote Profissional', 120, 15, 9990, 2), -- R$ 99,90 (+15 bônus)
    (3003, 'Pacote Premium', 300, 60, 19990, 3)     -- R$ 199,90 (+60 bônus)
ON CONFLICT DO NOTHING;
