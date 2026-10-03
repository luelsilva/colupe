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
--
--  Hierarquia de 3 níveis (espelho do menu GetNinjas):
--
--    categories      →  Assistência técnica
--      subcategories →    Eletrodomésticos
--        services    →      Geladeira e Freezer
--
-- ============================================================

-- Nível 1 — Categorias principais
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

COMMENT ON TABLE  categories             IS 'Categorias de serviço de nível 1 (ex: Assistência técnica, Aulas).';
COMMENT ON COLUMN categories.slug        IS 'Slug único usado na URL (ex: assistencia-tecnica).';
COMMENT ON COLUMN categories.icon        IS 'Nome do ícone Lucide ou caminho de SVG.';
COMMENT ON COLUMN categories.order_index IS 'Ordem de exibição no menu.';

-- Nível 2 — Subcategorias (grupos temáticos dentro de uma categoria)
CREATE TABLE IF NOT EXISTS subcategories (
    id          BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
    category_id BIGINT       NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    slug        TEXT         NOT NULL UNIQUE,
    name        TEXT         NOT NULL,
    description TEXT,
    icon        TEXT,
    is_active   BOOLEAN      NOT NULL DEFAULT true,
    order_index INT          NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  subcategories             IS 'Grupos temáticos de nível 2 dentro de uma categoria (ex: Eletrodomésticos, Informática e Telefonia).';
COMMENT ON COLUMN subcategories.category_id IS 'Categoria pai.';
COMMENT ON COLUMN subcategories.slug        IS 'Slug único usado na URL (ex: eletrodomesticos).';
COMMENT ON COLUMN subcategories.order_index IS 'Ordem de exibição dentro da categoria.';

-- Nível 3 — Serviços individuais (itens folha da árvore)
CREATE TABLE IF NOT EXISTS services (
    id                BIGINT       PRIMARY KEY DEFAULT snowflake_id(),
    subcategory_id    BIGINT       NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
    slug              TEXT         NOT NULL UNIQUE,
    name              TEXT         NOT NULL,
    description       TEXT,
    icon              TEXT,
    href              TEXT,        -- Caminho relativo original do GetNinjas (ex: assistencia-tecnica/geladeira-e-freezer)
    lead_cost_credits INT          NOT NULL DEFAULT 10, -- Custo em créditos para o profissional desbloquear o lead
    form_schema       JSONB,       -- Perguntas e campos dinâmicos do formulário de solicitação
    is_active         BOOLEAN      NOT NULL DEFAULT true,
    order_index       INT          NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  services                  IS 'Serviços individuais de nível 3 — itens folha do catálogo (ex: Geladeira e Freezer).';
COMMENT ON COLUMN services.subcategory_id   IS 'Subcategoria pai.';
COMMENT ON COLUMN services.href             IS 'Caminho relativo original do GetNinjas para referência.';
COMMENT ON COLUMN services.lead_cost_credits IS 'Custo em créditos para o profissional desbloquear um lead deste serviço.';
COMMENT ON COLUMN services.form_schema      IS 'Schema JSONB das perguntas dinâmicas do formulário de solicitação.';


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

DROP TRIGGER IF EXISTS update_subcategories_updated_at ON subcategories;
CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON subcategories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
--  SEEDS INICIAIS (Categorias, Subcategorias e Serviços)
-- ============================================================

-- Nível 1: Categorias principais
INSERT INTO categories (id, slug, name, description, icon, order_index)
VALUES
    (1001, 'assistencia-tecnica', 'Assistência técnica',  'Conserto de celulares, computadores, eletrodomésticos e TV.',       'wrench',       1),
    (1002, 'aulas',              'Aulas',                 'Aulas particulares, idiomas, reforço escolar e esportes.',           'book-open',    2),
    (1003, 'automoveis',         'Autos',                 'Mecânica, funilaria, pintura, elétrica e vidraçaria automotiva.',    'car',          3),
    (1004, 'consultoria',        'Consultoria',           'Jurídico, negócios, mídia, contabilidade e consultoria pessoal.',   'briefcase',    4),
    (1005, 'design-e-tecnologia','Design e Tecnologia',   'Criação de sites, logos, marketing digital e design gráfico.',     'laptop',       5),
    (1006, 'eventos',            'Eventos',               'Buffet, fotografia, DJs, decoração e organização de festas.',       'party-popper', 6),
    (1007, 'moda-e-beleza',      'Moda e beleza',         'Cabeleireiros, esteticistas, manicure, depilação e estilo.',        'scissors',     7),
    (1008, 'reformas-e-reparos', 'Reformas e reparos',    'Eletricistas, encanadores, pintores, pedreiros e marcenaria.',      'hammer',       8),
    (1009, 'saude',              'Saúde',                 'Médicos, psicólogos, fisioterapeutas e terapias alternativas.',     'heart-pulse',  9),
    (1010, 'familia',            'Serviços Domésticos',   'Diaristas, babás, cozinheiras, motoristas e cuidados com pets.',   'home',         10)
ON CONFLICT (slug) DO NOTHING;


-- Nível 2: Subcategorias
INSERT INTO subcategories (id, category_id, slug, name, order_index)
VALUES
    -- Assistência técnica (1001)
    (2001, 1001, 'aparelhos-eletronicos',   'Aparelhos Eletrônicos',    1),
    (2002, 1001, 'eletrodomesticos',        'Eletrodomésticos',         2),
    (2003, 1001, 'informatica-e-telefonia', 'Informática e Telefonia',  3),

    -- Aulas (1002)
    (2004, 1002, 'academicos',              'Acadêmicos',               1),
    (2005, 1002, 'artes-e-entretenimento',  'Artes e Entretenimento',   2),
    (2006, 1002, 'esportes',               'Esportes',                 3),
    (2007, 1002, 'tecnologia-aulas',       'Tecnologia',               4),

    -- Autos (1003)
    (2008, 1003, 'auto-eletrica',           'Auto Elétrica',            1),
    (2009, 1003, 'funilaria-e-pintura',     'Funilaria e Pintura',      2),
    (2010, 1003, 'vidracaria-automotiva',   'Vidraçaria Automotiva',    3),
    (2011, 1003, 'mecanica',               'Mecânica',                 4),
    (2012, 1003, 'venda-de-automoveis',     'Venda de Automóveis',      5),

    -- Consultoria (1004)
    (2013, 1004, 'midia',                  'Mídia',                    1),
    (2014, 1004, 'negocios',               'Negócios',                 2),
    (2015, 1004, 'juridico',               'Jurídico',                 3),
    (2016, 1004, 'pessoal',               'Pessoal',                  4),

    -- Design e Tecnologia (1005)
    (2017, 1005, 'tecnologia-design',      'Tecnologia',               1),
    (2018, 1005, 'grafica',               'Gráfica',                  2),
    (2019, 1005, 'audio-visual',           'Áudio / Visual',           3),

    -- Eventos (1006)
    (2020, 1006, 'equipe-e-suporte',       'Equipe e Suporte',         1),
    (2021, 1006, 'comes-e-bebes',          'Comes e bebes',            2),
    (2022, 1006, 'musica-e-animacao',      'Música e animação',        3),
    (2023, 1006, 'servicos-complementares','Serviços Complementares',  4),

    -- Moda e beleza (1007)
    (2024, 1007, 'beleza',                'Beleza',                   1),
    (2025, 1007, 'cabelo',               'Cabelo',                   2),
    (2026, 1007, 'estilo',               'Estilo',                   3),
    (2027, 1007, 'artes-e-magia',         'Artes e Magia',            4),

    -- Reformas e reparos (1008)
    (2028, 1008, 'aluguel-de-maquinario',  'Aluguel de Maquinário',    1),
    (2029, 1008, 'construcao',            'Construção',               2),
    (2030, 1008, 'instalacao',            'Instalação',               3),
    (2031, 1008, 'reformas-reparos-sub',   'Reformas e Reparos',       4),
    (2032, 1008, 'servicos-gerais',        'Serviços Gerais',          5),
    (2033, 1008, 'para-casa',             'Para Casa',                6),

    -- Saúde (1009)
    (2034, 1009, 'biomedicina-estetica',   'Biomedicina Estética',     1),
    (2035, 1009, 'para-o-corpo',           'Para o Corpo',             2),
    (2036, 1009, 'para-a-mente',           'Para a Mente',             3),
    (2037, 1009, 'para-a-familia-saude',   'Para a Família',           4),

    -- Serviços Domésticos (1010)
    (2038, 1010, 'para-a-casa-dom',        'Para a Casa',              1),
    (2039, 1010, 'para-a-familia-dom',     'Para a Família',           2),
    (2040, 1010, 'para-os-pets',           'Para os Pets',             3)
ON CONFLICT (slug) DO NOTHING;


-- Nível 3: Serviços (amostra dos principais — restante via script de seed)
INSERT INTO services (id, subcategory_id, slug, name, href, lead_cost_credits, order_index)
VALUES
    -- Eletrodomésticos
    (3001, 2002, 'geladeira-e-freezer', 'Geladeira e Freezer',       'assistencia-tecnica/geladeira-e-freezer', 10, 1),
    (3002, 2002, 'maquina-de-lavar',    'Máquina de Lavar',          'assistencia-tecnica/lava-roupa',          10, 2),
    (3003, 2002, 'micro-ondas',         'Microondas',                'assistencia-tecnica/micro-ondas',         10, 3),
    -- Informática e Telefonia
    (3004, 2003, 'celular',             'Celular',                   'assistencia-tecnica/celular',             10, 1),
    (3005, 2003, 'notebook',            'Notebook',                  'assistencia-tecnica/notebooks-e-laptops', 10, 2),
    -- Reformas e Reparos
    (3006, 2031, 'eletricista',         'Eletricista',               'reformas-e-reparos/eletricista',          15, 1),
    (3007, 2031, 'encanador',           'Encanador',                 'reformas-e-reparos/encanador',            15, 2),
    (3008, 2031, 'pintor',              'Pintor',                    'reformas-e-reparos/pintor',               12, 3),
    -- Serviços Gerais
    (3009, 2032, 'marido-de-aluguel',   'Marido de Aluguel',         'reformas-e-reparos/marido-de-aluguel',    10, 1),
    (3010, 2032, 'mudancas-e-carretos', 'Mudanças e Carretos',       'reformas-e-reparos/mudancas-e-carretos',  15, 2),
    -- Para a Casa (Domésticos)
    (3011, 2038, 'diarista',            'Diarista',                  'familia/diarista',                        10, 1),
    -- Para a Família (Domésticos)
    (3012, 2039, 'baba',                'Babá',                      'familia/baba',                            10, 1),
    (3013, 2039, 'cozinheira',          'Cozinheira',                'familia/cozinheira',                      10, 2),
    -- Para os Pets
    (3014, 2040, 'adestrador-de-caes',  'Adestrador de Cães',        'familia/adestrador-de-caes',              10, 1),
    -- Design e Tecnologia
    (3015, 2017, 'criacao-de-sites',    'Desenvolvimento de sites',  'design-e-tecnologia/desenvolvimento-de-sites-e-sistemas', 20, 1),
    (3016, 2017, 'marketing-digital',   'Marketing digital',         'design-e-tecnologia/marketing-online',    18, 2),
    -- Jurídico
    (3017, 2015, 'advogado',            'Advogado',                  'consultoria/advogado',                    20, 1),
    -- Para o Corpo
    (3018, 2035, 'dentista',            'Dentista',                  'saude/dentista',                          15, 1),
    (3019, 2035, 'psicologo',           'Psicólogo',                 'saude/psicologo',                         15, 2)
ON CONFLICT (slug) DO NOTHING;


INSERT INTO credit_packages (id, name, credits_amount, bonus_credits, price_cents, order_index)
VALUES
    (4001, 'Pacote Básico',        50,  0,  4990,  1),  -- R$  49,90
    (4002, 'Pacote Profissional', 120, 15,  9990,  2),  -- R$  99,90 (+15 bônus)
    (4003, 'Pacote Premium',      300, 60, 19990,  3)   -- R$ 199,90 (+60 bônus)
ON CONFLICT DO NOTHING;
