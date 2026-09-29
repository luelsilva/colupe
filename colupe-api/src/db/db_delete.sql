-- Deletar a extensão se existir (cascade para remover dependências)
DROP EXTENSION IF EXISTS "pgcrypto" CASCADE;

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Deletar todas as tabelas
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    
    -- Deletar todos os enums
    FOR r IN (SELECT typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND t.typtype = 'e') LOOP
        EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;

    -- Deletar todas as funções criadas no schema public (excluindo as que pertencem a extensões)
    FOR r IN (SELECT proname, oidvectortypes(proargtypes) as args 
              FROM pg_proc p 
              JOIN pg_namespace n ON n.oid = p.pronamespace 
              WHERE n.nspname = 'public'
                AND p.oid NOT IN (SELECT objid FROM pg_depend WHERE deptype = 'e')) LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident(r.proname) || '(' || r.args || ') CASCADE';
    END LOOP;
END $$;
