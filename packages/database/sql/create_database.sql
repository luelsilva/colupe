-- ============================================================
--  xSQL COMPLETO PARA CRIAR O BANCO DE DADOS - COLUPE
--  Marketplace de Serviços (Estilo GetNinjas) + Snowflake ID
-- ============================================================
-- ============================================================
--  Extensões
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- ============================================================
--  ENUMs
-- ============================================================
DO $$ BEGIN CREATE TYPE otp_type AS ENUM ('registration', 'password_reset');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('admin', 'professional', 'client');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE professional_status AS ENUM ('pending', 'verified', 'rejected', 'suspended');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE request_status AS ENUM (
    'open',
    'in_progress',
    'completed',
    'cancelled',
    'expired'
);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE lead_unlock_status AS ENUM ('unlocked', 'contacted', 'hired', 'declined');
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN CREATE TYPE transaction_type AS ENUM (
    'purchase',
    'lead_unlock',
    'refund',
    'bonus',
    'admin_adjustment'
);
EXCEPTION
WHEN duplicate_object THEN null;
END $$;
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
    worker_id INT PRIMARY KEY CHECK (
        worker_id BETWEEN 0 AND 15
    ),
    last_ms BIGINT NOT NULL DEFAULT 0,
    sequence INT NOT NULL DEFAULT -1 CHECK (
        sequence BETWEEN -1 AND 127
    )
);
COMMENT ON TABLE snowflake_state IS 'Estado persistente da geração de Snowflake ID (uma linha por worker).';
COMMENT ON COLUMN snowflake_state.worker_id IS 'Identificador do nó (0–15).';
COMMENT ON COLUMN snowflake_state.last_ms IS 'Último timestamp (ms) em que um Snowflake foi emitido.';
COMMENT ON COLUMN snowflake_state.sequence IS 'Contador sequencial no mesmo milissegundo (−1 = nunca usado).';
-- Seed do worker 1 como nó padrão
INSERT INTO snowflake_state (worker_id, last_ms, sequence)
VALUES (1, 0, -1) ON CONFLICT DO NOTHING;
CREATE OR REPLACE FUNCTION generate_snowflake_id(p_worker_id INT DEFAULT 1) RETURNS BIGINT LANGUAGE plpgsql AS $$
    /*
     Retorna um Snowflake ID de 52 bits como BIGINT (JS Safe Integer).
     
     Modelo de concorrência:
     • SELECT … FOR UPDATE bloqueia a linha de estado do worker.
     • Sessões concorrentes do mesmo worker ficam em fila atrás do lock.
     • Workers diferentes nunca disputam entre si.
     
     Clock skew:
     • Se o relógio do sistema voltar, a função lança exceção
     em vez de arriscar IDs duplicados.
     
     Overflow de sequência:
     • Se 128 IDs forem solicitados no mesmo milissegundo, a função
     faz busy-wait (pg_sleep 0.001 s) até o próximo ms virar.
     */
DECLARE c_epoch CONSTANT BIGINT := 1767225600000;
-- 2026-01-01 00:00:00 UTC
c_max_seq CONSTANT INT := 127;
-- 2^7 − 1 (128 IDs/ms por worker)
c_max_wkr CONSTANT INT := 15;
-- 2^4 − 1 (Até 16 workers: 0 a 15)
v_now_ms BIGINT;
v_last_ms BIGINT;
v_seq INT;
BEGIN IF p_worker_id < 0
OR p_worker_id > c_max_wkr THEN RAISE EXCEPTION 'worker_id deve estar entre 0 e %, recebido: %',
c_max_wkr,
p_worker_id;
END IF;
INSERT INTO snowflake_state (worker_id, last_ms, sequence)
VALUES (p_worker_id, 0, -1) ON CONFLICT (worker_id) DO NOTHING;
SELECT last_ms,
    sequence INTO v_last_ms,
    v_seq
FROM snowflake_state
WHERE worker_id = p_worker_id FOR
UPDATE;
v_now_ms := FLOOR(
    EXTRACT(
        EPOCH
        FROM clock_timestamp()
    ) * 1000
)::BIGINT;
IF v_now_ms < v_last_ms THEN RAISE EXCEPTION 'Relógio voltou % ms — geração de ID recusada.',
(v_last_ms - v_now_ms);
END IF;
IF v_now_ms = v_last_ms THEN v_seq := v_seq + 1;
IF v_seq > c_max_seq THEN LOOP PERFORM pg_sleep(0.001);
v_now_ms := FLOOR(
    EXTRACT(
        EPOCH
        FROM clock_timestamp()
    ) * 1000
)::BIGINT;
EXIT
WHEN v_now_ms > v_last_ms;
END LOOP;
v_seq := 0;
END IF;
ELSE v_seq := 0;
END IF;
UPDATE snowflake_state
SET last_ms = v_now_ms,
    sequence = v_seq
WHERE worker_id = p_worker_id;
RETURN ((v_now_ms - c_epoch) << 11) | (p_worker_id::BIGINT << 7) | v_seq::BIGINT;
END;
$$;
CREATE OR REPLACE FUNCTION decode_snowflake_id(p_id BIGINT) RETURNS TABLE (
        snowflake_id BIGINT,
        generated_at TIMESTAMPTZ,
        worker_id INT,
        sequence INT
    ) LANGUAGE sql STABLE AS $$
SELECT p_id AS snowflake_id,
    TO_TIMESTAMP((p_id >> 11) / 1000.0 + 1767225600) AS generated_at,
    ((p_id >> 7) & 15)::INT AS worker_id,
    (p_id & 127)::INT AS sequence;
$$;
CREATE OR REPLACE FUNCTION snowflake_id() RETURNS BIGINT LANGUAGE sql AS $$
SELECT generate_snowflake_id(1);
$$;
-- ============================================================
--  TABELA: keep_alive
-- ============================================================
CREATE TABLE IF NOT EXISTS keep_alive (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- ============================================================
--  TABELA: profiles (Usuários Base do Sistema)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id BIGINT PRIMARY KEY DEFAULT snowflake_id(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    role TEXT NOT NULL DEFAULT 'client',
    -- 'admin', 'professional', 'client'
    must_change_password BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
-- Seed Admin Padrão
INSERT INTO profiles (
        email,
        password_hash,
        full_name,
        is_verified,
        role
    )
VALUES (
        'luizkrx@gmail.com',
        '$argon2id$v=19$m=65536,t=2,p=1$aBjdgDHKifJd2cOOXB1b8PTM9uDLo59RBeGsptR6MMs$Mbzp3knjIpProvL19LTJj0qi4udF7fAYwhb909qhEEM',
        'Luiz Carlos',
        true,
        'admin'
    ) ON CONFLICT (email) DO
UPDATE
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
    id BIGINT PRIMARY KEY DEFAULT snowflake_id(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    -- Nome do ícone Lucide / SVG
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE categories IS 'Categorias de serviço de nível 1 (ex: Assistência técnica, Aulas).';
COMMENT ON COLUMN categories.slug IS 'Slug único usado na URL (ex: assistencia-tecnica).';
COMMENT ON COLUMN categories.icon IS 'Nome do ícone Lucide ou caminho de SVG.';
COMMENT ON COLUMN categories.order_index IS 'Ordem de exibição no menu.';
-- Nível 2 — Subcategorias (grupos temáticos dentro de uma categoria)
CREATE TABLE IF NOT EXISTS subcategories (
    id BIGINT PRIMARY KEY DEFAULT snowflake_id(),
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE subcategories IS 'Grupos temáticos de nível 2 dentro de uma categoria (ex: Eletrodomésticos, Informática e Telefonia).';
COMMENT ON COLUMN subcategories.category_id IS 'Categoria pai.';
COMMENT ON COLUMN subcategories.slug IS 'Slug único usado na URL (ex: eletrodomesticos).';
COMMENT ON COLUMN subcategories.order_index IS 'Ordem de exibição dentro da categoria.';
-- Nível 3 — Serviços individuais (itens folha da árvore)
CREATE TABLE IF NOT EXISTS services (
    id BIGINT PRIMARY KEY DEFAULT snowflake_id(),
    subcategory_id BIGINT NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    href TEXT,
    -- Caminho relativo original do GetNinjas (ex: assistencia-tecnica/geladeira-e-freezer)
    lead_cost_credits INT NOT NULL DEFAULT 10,
    -- Custo em créditos para o profissional desbloquear o lead
    form_schema JSONB,
    -- Perguntas e campos dinâmicos do formulário de solicitação
    is_active BOOLEAN NOT NULL DEFAULT true,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE services IS 'Serviços individuais de nível 3 — itens folha do catálogo (ex: Geladeira e Freezer).';
COMMENT ON COLUMN services.subcategory_id IS 'Subcategoria pai.';
COMMENT ON COLUMN services.href IS 'Caminho relativo original do GetNinjas para referência.';
COMMENT ON COLUMN services.lead_cost_credits IS 'Custo em créditos para o profissional desbloquear um lead deste serviço.';
COMMENT ON COLUMN services.form_schema IS 'Schema JSONB das perguntas dinâmicas do formulário de solicitação.';
-- ============================================================
--  TABELAS DE PROFISSIONAIS
-- ============================================================
CREATE TABLE IF NOT EXISTS professional_profiles (
    id BIGINT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL DEFAULT 'CPF',
    -- 'CPF' ou 'CNPJ'
    document_number TEXT NOT NULL UNIQUE,
    company_name TEXT,
    whatsapp TEXT NOT NULL,
    bio TEXT,
    experience_years INT DEFAULT 0,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    -- UF ex: 'SC'
    neighborhood TEXT,
    service_radius_km INT NOT NULL DEFAULT 30,
    -- Raio de atendimento em km
    status professional_status NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    credits_balance INT NOT NULL DEFAULT 20,
    -- Saldo inicial de moedas/créditos (bônus de boas-vindas)
    rating_avg NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
    -- Média de avaliações (ex: 4.85)
    rating_count INT NOT NULL DEFAULT 0,
    -- Total de avaliações recebidas
    is_available BOOLEAN NOT NULL DEFAULT true,
    -- Disponível para receber novos pedidos
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Especialidades / Serviços que o profissional atende (N:N)
CREATE TABLE IF NOT EXISTS professional_services (
    professional_id BIGINT NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
    service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (professional_id, service_id)
);
-- Portfólio de Fotos de Trabalhos Realizados
CREATE TABLE IF NOT EXISTS professional_portfolio (
    id BIGINT PRIMARY KEY DEFAULT snowflake_id(),
    professional_id BIGINT NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ============================================================
--  TABELAS DE SOLICITAÇÕES DE SERVIÇOS (LEADS / PEDIDOS)
-- ============================================================
CREATE TABLE IF NOT EXISTS service_requests (
    id BIGINT PRIMARY KEY DEFAULT snowflake_id(),
    client_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    answers_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Respostas do formulário dinâmico
    photos_urls TEXT [] DEFAULT ARRAY []::TEXT [],
    -- Fotos do local/objeto do serviço
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    neighborhood TEXT,
    address_masked TEXT,
    -- Endereço mascarado (exibido antes do desbloqueio)
    address_full TEXT NOT NULL,
    -- Endereço completo (exibido apenas após desbloqueio)
    urgency TEXT NOT NULL DEFAULT 'medium',
    -- 'immediate', 'this_week', 'flexible'
    budget_range TEXT,
    -- Orçamento estimado pelo cliente (opcional)
    max_unlocks INT NOT NULL DEFAULT 4,
    -- Máximo de profissionais que podem desbloquear (padrão 4)
    unlocks_count INT NOT NULL DEFAULT 0,
    -- Quantidade atual de desbloqueios
    status request_status NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Desbloqueio de Contato do Pedido pelo Profissional
CREATE TABLE IF NOT EXISTS lead_unlocks (
    id BIGINT PRIMARY KEY DEFAULT snowflake_id(),
    request_id BIGINT NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    professional_id BIGINT NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
    credits_spent INT NOT NULL,
    status lead_unlock_status NOT NULL DEFAULT 'unlocked',
    notes TEXT,
    -- Anotações do profissional sobre a negociação
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (request_id, professional_id)
);
-- ============================================================
--  TABELA: reviews (Avaliações dos Clientes)
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT PRIMARY KEY DEFAULT snowflake_id(),
    request_id BIGINT NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    client_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    professional_id BIGINT NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (
        rating BETWEEN 1 AND 5
    ),
    comment TEXT,
    response_comment TEXT,
    -- Resposta pública do profissional à avaliação
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (request_id, professional_id)
);
-- ============================================================
--  TABELAS DE MOEDAS / CRÉDITOS & TRANSAÇÕES
-- ============================================================
CREATE TABLE IF NOT EXISTS credit_packages (
    id BIGINT PRIMARY KEY DEFAULT snowflake_id(),
    name TEXT NOT NULL,
    -- Ex: "Pacote Iniciante", "Pacote Profissional"
    credits_amount INT NOT NULL,
    -- Quantidade de moedas
    bonus_credits INT NOT NULL DEFAULT 0,
    price_cents INT NOT NULL,
    -- Valor em centavos (R$)
    is_active BOOLEAN NOT NULL DEFAULT true,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS credit_transactions (
    id BIGINT PRIMARY KEY DEFAULT snowflake_id(),
    professional_id BIGINT NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    -- Positivo para compra/bônus, negativo para consumo de lead
    balance_after INT NOT NULL,
    -- Saldo resultante
    type transaction_type NOT NULL,
    description TEXT NOT NULL,
    reference_id BIGINT,
    -- ID do lead_unlock ou do pacote
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ============================================================
--  TABELAS DE AUTENTICAÇÃO, TOKENS & AUDITORIA
-- ============================================================
CREATE TABLE IF NOT EXISTS otp_codes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    type otp_type NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES profiles(id) ON DELETE
    SET NULL,
        action TEXT NOT NULL,
        source_app TEXT NOT NULL DEFAULT 'colupe',
        ip_address TEXT,
        ip_port INTEGER,
        user_agent TEXT,
        metadata JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ============================================================
--  TRIGGERS E FUNÇÕES AUTOMÁTICAS
-- ============================================================
-- 1. Trigger universal para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE
UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE
UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_subcategories_updated_at ON subcategories;
CREATE TRIGGER update_subcategories_updated_at BEFORE
UPDATE ON subcategories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE
UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_professional_profiles_updated_at ON professional_profiles;
CREATE TRIGGER update_professional_profiles_updated_at BEFORE
UPDATE ON professional_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_service_requests_updated_at ON service_requests;
CREATE TRIGGER update_service_requests_updated_at BEFORE
UPDATE ON service_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_lead_unlocks_updated_at ON lead_unlocks;
CREATE TRIGGER update_lead_unlocks_updated_at BEFORE
UPDATE ON lead_unlocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE
UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- 2. Trigger para recalcular média de notas e total de avaliações do profissional
CREATE OR REPLACE FUNCTION recalculate_professional_rating() RETURNS TRIGGER AS $$
DECLARE v_prof_id BIGINT;
v_avg NUMERIC(3, 2);
v_count INT;
BEGIN v_prof_id := COALESCE(NEW.professional_id, OLD.professional_id);
SELECT COALESCE(AVG(rating), 0)::NUMERIC(3, 2),
    COUNT(*) INTO v_avg,
    v_count
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
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON reviews FOR EACH ROW EXECUTE FUNCTION recalculate_professional_rating();
-- 3. Trigger para incrementar unlocks_count no service_request
CREATE OR REPLACE FUNCTION handle_lead_unlock_count() RETURNS TRIGGER AS $$ BEGIN
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
AFTER
INSERT ON lead_unlocks FOR EACH ROW EXECUTE FUNCTION handle_lead_unlock_count();
-- ============================================================
--  SEED COMPLETO E LIMPO DO CATÁLOGO COLUPE
--  Fonte: categorias-subcategorias-serviços.csv
--  Total: 10 Categorias, 40 Subcategorias, 227 Serviços
-- ============================================================
-- 1. Categorias Principais (Nível 1)
INSERT INTO categories (id, slug, name, description, icon, order_index)
VALUES (
        1001,
        'assistencia-tecnica',
        'Assistência técnica',
        'Conserto de celulares, computadores, eletrodomésticos e TV.',
        'wrench',
        1
    ),
    (
        1002,
        'aulas',
        'Aulas',
        'Aulas particulares, idiomas, reforço escolar e esportes.',
        'book-open',
        2
    ),
    (
        1003,
        'autos',
        'Autos',
        'Mecânica, funilaria, pintura, elétrica e vidraçaria automotiva.',
        'car',
        3
    ),
    (
        1004,
        'consultoria',
        'Consultoria',
        'Jurídico, negócios, mídia, contabilidade e consultoria pessoal.',
        'briefcase',
        4
    ),
    (
        1005,
        'design-e-tecnologia',
        'Design e Tecnologia',
        'Criação de sites, logos, marketing digital e design gráfico.',
        'laptop',
        5
    ),
    (
        1006,
        'eventos',
        'Eventos',
        'Buffet, fotografia, DJs, decoração e organização de festas.',
        'party-popper',
        6
    ),
    (
        1007,
        'moda-e-beleza',
        'Moda e beleza',
        'Cabeleireiros, esteticistas, manicure, depilação e estilo.',
        'sparkles',
        7
    ),
    (
        1008,
        'reformas-e-reparos',
        'Reformas e reparos',
        'Eletricistas, encanadores, pintores, pedreiros e marcenaria.',
        'hammer',
        8
    ),
    (
        1009,
        'saude',
        'Saúde',
        'Médicos, psicólogos, fisioterapeutas e terapias alternativas.',
        'heart-pulse',
        9
    ),
    (
        1010,
        'servicos-domesticos',
        'Serviços Domésticos',
        'Diaristas, babás, cozinheiras, motoristas e cuidados com pets.',
        'home',
        10
    ) ON CONFLICT (id) DO
UPDATE
SET name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    order_index = EXCLUDED.order_index;
-- 2. Subcategorias (Nível 2)
INSERT INTO subcategories (id, category_id, slug, name, order_index)
VALUES (
        2001,
        1001,
        'aparelhos-eletronicos',
        'Aparelhos Eletrônicos',
        1
    ),
    (
        2002,
        1001,
        'eletrodomesticos',
        'Eletrodomésticos',
        2
    ),
    (
        2003,
        1001,
        'informatica-e-telefonia',
        'Informática e Telefonia',
        3
    ),
    (2004, 1002, 'academicos', 'Acadêmicos', 1),
    (
        2005,
        1002,
        'artes-e-entretenimento',
        'Artes e Entretenimento',
        2
    ),
    (2006, 1002, 'esportes', 'Esportes', 3),
    (2007, 1002, 'tecnologia', 'Tecnologia', 4),
    (2008, 1003, 'auto-eletrica', 'Auto Elétrica', 1),
    (
        2009,
        1003,
        'funilaria-e-pintura',
        'Funilaria e Pintura',
        2
    ),
    (
        2010,
        1003,
        'vidracaria-automotiva',
        'Vidraçaria Automotiva',
        3
    ),
    (2011, 1003, 'mecanica', 'Mecânica', 4),
    (
        2012,
        1003,
        'venda-de-automoveis',
        'Venda de Automóveis',
        5
    ),
    (2013, 1004, 'midia', 'Mídia', 1),
    (2014, 1004, 'negocios', 'Negócios', 2),
    (2015, 1004, 'juridico', 'Jurídico', 3),
    (2016, 1004, 'pessoal', 'Pessoal', 4),
    (
        2017,
        1005,
        'tecnologia-design-e-tecnologia',
        'Tecnologia',
        1
    ),
    (2018, 1005, 'grafica', 'Gráfica', 2),
    (2019, 1005, 'audio-visual', 'Áudio / Visual', 3),
    (
        2020,
        1006,
        'equipe-e-suporte',
        'Equipe e Suporte',
        1
    ),
    (2021, 1006, 'comes-e-bebes', 'Comes e bebes', 2),
    (
        2022,
        1006,
        'musica-e-animacao',
        'Música e animação',
        3
    ),
    (
        2023,
        1006,
        'servicos-complementares',
        'Serviços Complementares',
        4
    ),
    (2024, 1007, 'beleza', 'Beleza', 1),
    (2025, 1007, 'cabelo', 'Cabelo', 2),
    (2026, 1007, 'estilo', 'Estilo', 3),
    (2027, 1007, 'artes-e-magia', 'Artes e Magia', 4),
    (
        2028,
        1008,
        'aluguel-de-maquinario',
        'Aluguel de Maquinário',
        1
    ),
    (2029, 1008, 'construcao', 'Construção', 2),
    (2030, 1008, 'instalacao', 'Instalação', 3),
    (
        2031,
        1008,
        'reformas-e-reparos',
        'Reformas e Reparos',
        4
    ),
    (
        2032,
        1008,
        'servicos-gerais',
        'Serviços Gerais',
        5
    ),
    (2033, 1008, 'para-casa', 'Para Casa', 6),
    (
        2034,
        1009,
        'biomedicina-estetica',
        'Biomedicina Estética',
        1
    ),
    (2035, 1009, 'para-o-corpo', 'Para o Corpo', 2),
    (2036, 1009, 'para-a-mente', 'Para a Mente', 3),
    (
        2037,
        1009,
        'para-a-familia',
        'Para a Família',
        4
    ),
    (2038, 1010, 'para-a-casa', 'Para a Casa', 1),
    (
        2039,
        1010,
        'para-a-familia-servicos-domesticos',
        'Para a Família',
        2
    ),
    (2040, 1010, 'para-os-pets', 'Para os Pets', 3) ON CONFLICT (id) DO
UPDATE
SET name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    category_id = EXCLUDED.category_id,
    order_index = EXCLUDED.order_index;
-- 3. Serviços Especializados (Nível 3)
INSERT INTO services (
        id,
        subcategory_id,
        slug,
        name,
        lead_cost_credits,
        order_index
    )
VALUES (
        3001,
        2001,
        'aparelho-de-som',
        'Aparelho de Som',
        10,
        1
    ),
    (
        3002,
        2001,
        'aquecedor-a-gas',
        'Aquecedor a Gás',
        10,
        2
    ),
    (
        3003,
        2001,
        'ar-condicionado',
        'Ar Condicionado',
        10,
        3
    ),
    (3004, 2001, 'camera', 'Câmera', 10, 4),
    (
        3005,
        2001,
        'dvd-blu-ray',
        'DVD / Blu-Ray',
        10,
        5
    ),
    (
        3006,
        2001,
        'home-theater',
        'Home Theater',
        10,
        6
    ),
    (3007, 2001, 'televisao', 'Televisão', 10, 7),
    (3008, 2001, 'video-game', 'Video Game', 10, 8),
    (
        3009,
        2002,
        'adega-climatizada',
        'Adega Climatizada',
        10,
        1
    ),
    (
        3010,
        2002,
        'fogao-e-cooktop',
        'Fogão e Cooktop',
        10,
        2
    ),
    (
        3011,
        2002,
        'geladeira-e-freezer',
        'Geladeira e Freezer',
        10,
        3
    ),
    (3012, 2002, 'lava-louca', 'Lava Louça', 10, 4),
    (
        3013,
        2002,
        'maquina-de-costura',
        'Máquina de Costura',
        10,
        5
    ),
    (
        3014,
        2002,
        'maquina-de-lavar',
        'Máquina de Lavar',
        10,
        6
    ),
    (3015, 2002, 'microondas', 'Microondas', 10, 7),
    (
        3016,
        2002,
        'secadora-de-roupas',
        'Secadora de Roupas',
        10,
        8
    ),
    (
        3017,
        2003,
        'cabeamento-e-redes',
        'Cabeamento e Redes',
        10,
        1
    ),
    (3018, 2003, 'celular', 'Celular', 10, 2),
    (
        3019,
        2003,
        'computador-desktop',
        'Computador Desktop',
        10,
        3
    ),
    (
        3020,
        2003,
        'fone-de-ouvido',
        'Fone de Ouvido',
        10,
        4
    ),
    (3021, 2003, 'impressora', 'Impressora', 10, 5),
    (3022, 2003, 'notebook', 'Notebook', 10, 6),
    (3023, 2003, 'tablet', 'Tablet', 10, 7),
    (
        3024,
        2003,
        'telefone-fixo',
        'Telefone Fixo',
        10,
        8
    ),
    (
        3025,
        2003,
        'telefonia-pabx',
        'Telefonia PABX',
        10,
        9
    ),
    (3026, 2004, 'concursos', 'Concursos', 10, 1),
    (
        3027,
        2004,
        'escolares-e-reforco',
        'Escolares e Reforço',
        10,
        2
    ),
    (
        3028,
        2004,
        'educacao-especial',
        'Educação Especial',
        10,
        3
    ),
    (
        3029,
        2004,
        'ensino-superior',
        'Ensino Superior',
        10,
        4
    ),
    (
        3030,
        2004,
        'ensino-profissionalizante',
        'Ensino Profissionalizante',
        10,
        5
    ),
    (3031, 2004, 'idiomas', 'Idiomas', 10, 6),
    (3032, 2004, 'moda', 'Moda', 10, 7),
    (
        3033,
        2004,
        'pre-vestibular',
        'Pré-Vestibular',
        10,
        8
    ),
    (3034, 2004, 'saude', 'Saúde', 10, 9),
    (3035, 2004, 'tarefas', 'Tarefas', 10, 10),
    (3036, 2005, 'artes', 'Artes', 10, 1),
    (3037, 2005, 'artesanato', 'Artesanato', 10, 2),
    (3038, 2005, 'beleza', 'Beleza', 10, 3),
    (3039, 2005, 'bem-estar', 'Bem-Estar', 10, 4),
    (3040, 2005, 'circo', 'Circo', 10, 5),
    (3041, 2005, 'fotografia', 'Fotografia', 10, 6),
    (
        3042,
        2005,
        'moda-artes-e-entretenimento',
        'Moda',
        10,
        7
    ),
    (3043, 2005, 'musica', 'Música', 10, 8),
    (3044, 2005, 'paisagismo', 'Paisagismo', 10, 9),
    (3045, 2005, 'tv-e-teatro', 'TV e Teatro', 10, 10),
    (3046, 2006, 'danca', 'Dança', 10, 1),
    (3047, 2006, 'esportes', 'Esportes', 10, 2),
    (3048, 2006, 'jogos', 'Jogos', 10, 3),
    (3049, 2006, 'lazer', 'Lazer', 10, 4),
    (3050, 2006, 'luta', 'Luta', 10, 5),
    (
        3051,
        2007,
        'desenvolvimento-web',
        'Desenvolvimento Web',
        10,
        1
    ),
    (
        3052,
        2007,
        'esportes-eletronicos',
        'Esportes Eletrônicos',
        10,
        2
    ),
    (3053, 2007, 'informatica', 'Informática', 10, 3),
    (
        3054,
        2007,
        'marketing-digital',
        'Marketing Digital',
        10,
        4
    ),
    (
        3055,
        2008,
        'alarme-automotivo',
        'Alarme automotivo',
        10,
        1
    ),
    (
        3056,
        2008,
        'ar-condicionado-auto-eletrica',
        'Ar condicionado',
        10,
        2
    ),
    (
        3057,
        2008,
        'auto-eletrico',
        'Auto elétrico',
        10,
        3
    ),
    (
        3058,
        2008,
        'som-automotivo',
        'Som automotivo',
        10,
        4
    ),
    (3059, 2009, 'funilaria', 'Funilaria', 10, 1),
    (
        3060,
        2009,
        'higienizacao-e-polimento',
        'Higienização e Polimento',
        10,
        2
    ),
    (
        3061,
        2009,
        'martelinho-de-ouro',
        'Martelinho de Ouro',
        10,
        3
    ),
    (3062, 2009, 'pintura', 'Pintura', 10, 4),
    (3063, 2010, 'insulfilm', 'Insulfilm', 10, 1),
    (
        3064,
        2010,
        'vidracaria-automotiva',
        'Vidraçaria Automotiva',
        10,
        2
    ),
    (3065, 2011, 'borracharia', 'Borracharia', 10, 1),
    (3066, 2011, 'guincho', 'Guincho', 10, 2),
    (
        3067,
        2011,
        'mecanica-geral',
        'Mecânica Geral',
        10,
        3
    ),
    (
        3068,
        2012,
        'venda-de-automoveis',
        'Venda de Automóveis',
        10,
        1
    ),
    (
        3069,
        2013,
        'assessoria-de-imprensa',
        'Assessoria de Imprensa',
        10,
        1
    ),
    (
        3070,
        2013,
        'escrita-e-conteudo',
        'Escrita e Conteúdo',
        10,
        2
    ),
    (
        3071,
        2013,
        'pesquisa-em-geral',
        'Pesquisa em Geral',
        10,
        3
    ),
    (
        3072,
        2013,
        'producao-de-conteudo',
        'Produção de Conteúdo',
        10,
        4
    ),
    (3073, 2013, 'tradutores', 'Tradutores', 10, 5),
    (
        3074,
        2014,
        'administracao-de-imoveis',
        'Administração de Imóveis',
        10,
        1
    ),
    (
        3075,
        2014,
        'assessor-de-investimentos',
        'Assessor de Investimentos',
        10,
        2
    ),
    (
        3076,
        2014,
        'auxilio-administrativo',
        'Auxílio administrativo',
        10,
        3
    ),
    (3077, 2014, 'contador', 'Contador', 10, 4),
    (3078, 2014, 'corretor', 'Corretor', 10, 5),
    (3079, 2014, 'despachante', 'Despachante', 10, 6),
    (
        3080,
        2014,
        'digitalizar-documentos',
        'Digitalizar documentos',
        10,
        7
    ),
    (
        3081,
        2014,
        'economia-e-financas',
        'Economia e Finanças',
        10,
        8
    ),
    (
        3082,
        2014,
        'recrutamento-e-selecao',
        'Recrutamento e Seleção',
        10,
        9
    ),
    (
        3083,
        2014,
        'seguranca-do-trabalho',
        'Segurança do trabalho',
        10,
        10
    ),
    (3084, 2015, 'advogado', 'Advogado', 10, 1),
    (
        3085,
        2015,
        'mediacao-de-conflitos',
        'Mediação de Conflitos',
        10,
        2
    ),
    (
        3086,
        2015,
        'testamento-e-planejamento-patrimonial',
        'Testamento e Planejamento Patrimonial',
        10,
        3
    ),
    (
        3087,
        2016,
        'consultor-pessoal',
        'Consultor pessoal',
        10,
        1
    ),
    (
        3088,
        2016,
        'consultoria-especializada',
        'Consultoria especializada',
        10,
        2
    ),
    (
        3089,
        2016,
        'detetive-particular',
        'Detetive particular',
        10,
        3
    ),
    (
        3090,
        2016,
        'guia-de-turismo',
        'Guia de Turismo',
        10,
        4
    ),
    (
        3091,
        2017,
        'apps-para-smartphone',
        'Apps para smartphone',
        10,
        1
    ),
    (
        3092,
        2017,
        'desenvolvimento-de-games',
        'Desenvolvimento de games',
        10,
        2
    ),
    (
        3093,
        2017,
        'desenvolvimento-de-sites',
        'Desenvolvimento de sites',
        10,
        3
    ),
    (
        3094,
        2017,
        'marketing-digital-tecnologia-design-e-tecnologia',
        'Marketing digital',
        10,
        4
    ),
    (3095, 2017, 'ui-design', 'UI design', 10, 5),
    (3096, 2018, 'convites', 'Convites', 10, 1),
    (
        3097,
        2018,
        'criacao-de-logos',
        'Criação de logos',
        10,
        2
    ),
    (
        3098,
        2018,
        'criacao-de-marcas',
        'Criação de marcas',
        10,
        3
    ),
    (3099, 2018, 'diagramador', 'Diagramador', 10, 4),
    (
        3100,
        2018,
        'materiais-promocionais',
        'Materiais promocionais',
        10,
        5
    ),
    (
        3101,
        2018,
        'producao-grafica',
        'Produção gráfica',
        10,
        6
    ),
    (
        3102,
        2019,
        'animacao-motion',
        'Animação motion',
        10,
        1
    ),
    (
        3103,
        2019,
        'audio-e-video',
        'Áudio e Vídeo',
        10,
        2
    ),
    (
        3104,
        2019,
        'edicao-de-fotos',
        'Edição de fotos',
        10,
        3
    ),
    (
        3105,
        2019,
        'fotografia-audio-visual',
        'Fotografia',
        10,
        4
    ),
    (3106, 2019, 'ilustracao', 'Ilustração', 10, 5),
    (
        3107,
        2019,
        'modelagem-2d-e-3d',
        'Modelagem 2D e 3D',
        10,
        6
    ),
    (
        3108,
        2019,
        'restauracao-de-fotos',
        'Restauração de Fotos',
        10,
        7
    ),
    (3109, 2019, 'web-design', 'Web Design', 10, 8),
    (
        3110,
        2020,
        'assessor-de-eventos',
        'Assessor de eventos',
        10,
        1
    ),
    (
        3111,
        2020,
        'carros-de-casamento',
        'Carros de casamento',
        10,
        2
    ),
    (3112, 2020, 'celebrantes', 'Celebrantes', 10, 3),
    (
        3113,
        2020,
        'equipamento-para-festas',
        'Equipamento para festas',
        10,
        4
    ),
    (
        3114,
        2020,
        'garcons-e-copeiras',
        'Garçons e copeiras',
        10,
        5
    ),
    (
        3115,
        2020,
        'local-para-eventos',
        'Local para eventos',
        10,
        6
    ),
    (3116, 2020, 'manobrista', 'Manobrista', 10, 7),
    (
        3117,
        2020,
        'organizacao-de-eventos',
        'Organização de Eventos',
        10,
        8
    ),
    (
        3118,
        2020,
        'recepcionistas',
        'Recepcionistas',
        10,
        9
    ),
    (3119, 2020, 'segurancas', 'Seguranças', 10, 10),
    (3120, 2021, 'bartender', 'Bartender', 10, 1),
    (
        3121,
        2021,
        'buffet-completo',
        'Buffet completo',
        10,
        2
    ),
    (
        3122,
        2021,
        'chocolateiro',
        'Chocolateiro',
        10,
        3
    ),
    (
        3123,
        2021,
        'churrasqueiro',
        'Churrasqueiro',
        10,
        4
    ),
    (3124, 2021, 'confeiteira', 'Confeiteira', 10, 5),
    (
        3125,
        2022,
        'animacao-de-festas',
        'Animação de festas',
        10,
        1
    ),
    (
        3126,
        2022,
        'bandas-e-cantores',
        'Bandas e cantores',
        10,
        2
    ),
    (3127, 2022, 'djs', 'DJs', 10, 3),
    (
        3128,
        2022,
        'onibus-balada',
        'Ônibus Balada',
        10,
        4
    ),
    (
        3129,
        2023,
        'brindes-e-lembrancinhas',
        'Brindes e lembrancinhas',
        10,
        1
    ),
    (
        3130,
        2023,
        'convites-servicos-complementares',
        'Convites',
        10,
        2
    ),
    (3131, 2023, 'decoracao', 'Decoração', 10, 3),
    (
        3132,
        2023,
        'edicao-de-videos',
        'Edição de vídeos',
        10,
        4
    ),
    (
        3133,
        2023,
        'fotografia-servicos-complementares',
        'Fotografia',
        10,
        5
    ),
    (3134, 2023, 'florista', 'Florista', 10, 6),
    (
        3135,
        2024,
        'bronzeamento',
        'Bronzeamento',
        10,
        1
    ),
    (3136, 2024, 'depilacao', 'Depilação', 10, 2),
    (
        3137,
        2024,
        'design-de-sobrancelhas',
        'Design de sobrancelhas',
        10,
        3
    ),
    (
        3138,
        2024,
        'designer-de-cilios',
        'Designer de cílios',
        10,
        4
    ),
    (
        3139,
        2024,
        'esteticistas',
        'Esteticistas',
        10,
        5
    ),
    (
        3140,
        2024,
        'manicure-e-pedicure',
        'Manicure e pedicure',
        10,
        6
    ),
    (3141, 2024, 'maquiadores', 'Maquiadores', 10, 7),
    (
        3142,
        2024,
        'micropigmentador',
        'Micropigmentador',
        10,
        8
    ),
    (3143, 2024, 'podologo', 'Podólogo', 10, 9),
    (
        3144,
        2025,
        'cabeleireiros',
        'Cabeleireiros',
        10,
        1
    ),
    (3145, 2025, 'barbeiros', 'Barbeiros', 10, 2),
    (3146, 2026, 'alfaiate', 'Alfaiate', 10, 1),
    (
        3147,
        2026,
        'corte-e-costura',
        'Corte e costura',
        10,
        2
    ),
    (
        3148,
        2026,
        'personal-stylist',
        'Personal stylist',
        10,
        3
    ),
    (3149, 2026, 'sapateiro', 'Sapateiro', 10, 4),
    (3150, 2026, 'visagista', 'Visagista', 10, 5),
    (
        3151,
        2027,
        'artesanato-artes-e-magia',
        'Artesanato',
        10,
        1
    ),
    (3152, 2027, 'esoterico', 'Esotérico', 10, 2),
    (
        3153,
        2028,
        'aluguel-de-maquinario',
        'Aluguel de maquinário',
        10,
        1
    ),
    (3154, 2029, 'arquitetos', 'Arquitetos', 10, 1),
    (
        3155,
        2029,
        'design-de-interiores',
        'Design de Interiores',
        10,
        2
    ),
    (3156, 2029, 'empreiteiro', 'Empreiteiro', 10, 3),
    (3157, 2029, 'engenheiro', 'Engenheiro', 10, 4),
    (
        3158,
        2029,
        'limpeza-pos-obra',
        'Limpeza pós obra',
        10,
        5
    ),
    (
        3159,
        2029,
        'marmoraria-e-granitos',
        'Marmoraria e Granitos',
        10,
        6
    ),
    (3160, 2029, 'pedreiro', 'Pedreiro', 10, 7),
    (
        3161,
        2029,
        'poco-artesiano',
        'Poço Artesiano',
        10,
        8
    ),
    (
        3162,
        2029,
        'remocao-de-entulho',
        'Remoção de Entulho',
        10,
        9
    ),
    (3163, 2030, 'antenista', 'Antenista', 10, 1),
    (
        3164,
        2030,
        'automacao-residencial',
        'Automação residencial',
        10,
        2
    ),
    (
        3165,
        2030,
        'instalacao-de-eletronicos',
        'Instalação de eletrônicos',
        10,
        3
    ),
    (
        3166,
        2030,
        'instalador-tv-digital',
        'Instalador tv digital',
        10,
        4
    ),
    (
        3167,
        2030,
        'seguranca-eletronica',
        'Segurança eletrônica',
        10,
        5
    ),
    (
        3168,
        2030,
        'toldos-e-coberturas',
        'Toldos e Coberturas',
        10,
        6
    ),
    (3169, 2031, 'encanador', 'Encanador', 10, 1),
    (3170, 2031, 'eletricista', 'Eletricista', 10, 2),
    (3171, 2031, 'gas', 'Gás', 10, 3),
    (
        3172,
        2031,
        'gesso-e-drywall',
        'Gesso e drywall',
        10,
        4
    ),
    (
        3173,
        2031,
        'pavimentacao',
        'Pavimentação',
        10,
        5
    ),
    (3174, 2031, 'pintor', 'Pintor', 10, 6),
    (
        3175,
        2031,
        'serralheria-e-solda',
        'Serralheria e solda',
        10,
        7
    ),
    (3176, 2031, 'vidraceiro', 'Vidraceiro', 10, 8),
    (3177, 2032, 'chaveiro', 'Chaveiro', 10, 1),
    (3178, 2032, 'dedetizador', 'Dedetizador', 10, 2),
    (
        3179,
        2032,
        'desentupidor',
        'Desentupidor',
        10,
        3
    ),
    (3180, 2032, 'desinfeccao', 'Desinfecção', 10, 4),
    (
        3181,
        2032,
        'impermeabilizador',
        'Impermeabilizador',
        10,
        5
    ),
    (3182, 2032, 'marceneiro', 'Marceneiro', 10, 6),
    (
        3183,
        2032,
        'marido-de-aluguel',
        'Marido de Aluguel',
        10,
        7
    ),
    (
        3184,
        2032,
        'mudancas-e-carretos',
        'Mudanças e Carretos',
        10,
        8
    ),
    (3185, 2032, 'tapeceiro', 'Tapeceiro', 10, 9),
    (3186, 2033, 'banheira', 'Banheira', 10, 1),
    (
        3187,
        2033,
        'coifas-e-exaustores',
        'Coifas e Exaustores',
        10,
        2
    ),
    (3188, 2033, 'decorador', 'Decorador', 10, 3),
    (
        3189,
        2033,
        'instalador-de-papel-de-parede',
        'Instalador de Papel de Parede',
        10,
        4
    ),
    (3190, 2033, 'jardinagem', 'Jardinagem', 10, 5),
    (
        3191,
        2033,
        'montador-de-moveis',
        'Montador de Móveis',
        10,
        6
    ),
    (3192, 2033, 'paisagista', 'Paisagista', 10, 7),
    (3193, 2033, 'piscina', 'Piscina', 10, 8),
    (
        3194,
        2033,
        'redes-de-protecao',
        'Redes de Proteção',
        10,
        9
    ),
    (
        3195,
        2034,
        'biomedicina-estetica',
        'Biomedicina Estética',
        10,
        1
    ),
    (
        3196,
        2034,
        'remocao-de-tatuagem',
        'Remoção de Tatuagem',
        10,
        2
    ),
    (3197, 2035, 'cozinheira', 'Cozinheira', 10, 1),
    (3198, 2035, 'dentista', 'Dentista', 10, 2),
    (
        3199,
        2035,
        'fisioterapeuta',
        'Fisioterapeuta',
        10,
        3
    ),
    (
        3200,
        2035,
        'fonoaudiologo',
        'Fonoaudiólogo',
        10,
        4
    ),
    (3201, 2035, 'medico', 'Médico', 10, 5),
    (
        3202,
        2035,
        'nutricionista',
        'Nutricionista',
        10,
        6
    ),
    (3203, 2035, 'quiropraxia', 'Quiropraxia', 10, 7),
    (
        3204,
        2035,
        'terapias-alternativas',
        'Terapias Alternativas',
        10,
        8
    ),
    (
        3205,
        2035,
        'terapia-ocupacional',
        'Terapia Ocupacional',
        10,
        9
    ),
    (
        3206,
        2036,
        'aconselhamento-conjugal-e-familiar',
        'Aconselhamento Conjugal e Familiar',
        10,
        1
    ),
    (3207, 2036, 'coach', 'Coach', 10, 2),
    (3208, 2036, 'doula', 'Doula', 10, 3),
    (
        3209,
        2036,
        'psicanalista',
        'Psicanalista',
        10,
        4
    ),
    (3210, 2036, 'psicologo', 'Psicólogo', 10, 5),
    (
        3211,
        2037,
        'cuidador-de-pessoas',
        'Cuidador de Pessoas',
        10,
        1
    ),
    (3212, 2037, 'enfermeira', 'Enfermeira', 10, 2),
    (3213, 2038, 'diarista', 'Diarista', 10, 1),
    (
        3214,
        2038,
        'limpeza-de-piscina',
        'Limpeza de Piscina',
        10,
        2
    ),
    (3215, 2038, 'passadeira', 'Passadeira', 10, 3),
    (
        3216,
        2038,
        'tapeceiro-para-a-casa',
        'Tapeceiro',
        10,
        4
    ),
    (3217, 2038, 'lavadeira', 'Lavadeira', 10, 5),
    (
        3218,
        2038,
        'personal-shopper',
        'Personal shopper',
        10,
        6
    ),
    (3219, 2039, 'baba', 'Babá', 10, 1),
    (
        3220,
        2039,
        'cozinheira-para-a-familia-servicos-domesticos',
        'Cozinheira',
        10,
        2
    ),
    (3221, 2039, 'entregador', 'Entregador', 10, 3),
    (3222, 2039, 'motorista', 'Motorista', 10, 4),
    (
        3223,
        2039,
        'personal-organizer',
        'Personal Organizer',
        10,
        5
    ),
    (
        3224,
        2039,
        'seguranca-particular',
        'Segurança Particular',
        10,
        6
    ),
    (
        3225,
        2040,
        'adestrador-de-caes',
        'Adestrador de Cães',
        10,
        1
    ),
    (
        3226,
        2040,
        'passeador-de-caes',
        'Passeador de Cães',
        10,
        2
    ),
    (
        3227,
        2040,
        'servicos-para-pets',
        'Serviços para Pets',
        10,
        3
    ) ON CONFLICT (id) DO
UPDATE
SET name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    subcategory_id = EXCLUDED.subcategory_id,
    lead_cost_credits = EXCLUDED.lead_cost_credits,
    order_index = EXCLUDED.order_index;
-- 4. Pacotes de Moedas / Créditos
INSERT INTO credit_packages (
        id,
        name,
        credits_amount,
        bonus_credits,
        price_cents,
        order_index
    )
VALUES (4001, 'Pacote Básico', 50, 0, 4990, 1),
    -- R$  49,90
    (4002, 'Pacote Profissional', 120, 15, 9990, 2),
    -- R$  99,90 (+15 bônus)
    (4003, 'Pacote Premium', 300, 60, 19990, 3) -- R$ 199,90 (+60 bônus)
    ON CONFLICT (id) DO
UPDATE
SET name = EXCLUDED.name,
    credits_amount = EXCLUDED.credits_amount,
    bonus_credits = EXCLUDED.bonus_credits,
    price_cents = EXCLUDED.price_cents,
    order_index = EXCLUDED.order_index;