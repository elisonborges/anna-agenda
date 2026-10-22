-- Testes de integração para executar SOMENTE na branch Neon isolada.
-- O teste de sucesso usa uma entrada e coordenador de teste já existentes nessa branch.
-- Cada alteração é revertida por uma subtransação PL/pgSQL.
DO $$
DECLARE v_before integer; v_after integer; v_status text; v_ok boolean := false;
BEGIN
  SELECT count(*) INTO v_before FROM public.agenda_coordinator_reviews_test WHERE entry_id='a3c646c2-2e32-4fc5-8728-8e8838b9e008';
  BEGIN
    PERFORM set_config('request.jwt.claims','{"sub":"c4faeb41-e0b1-4364-8027-b156b6863b31","role":"authenticated"}',true);
    PERFORM public.register_coordinator_decision_test('a3c646c2-2e32-4fc5-8728-8e8838b9e008','needs_clarification','Teste transacional descartado');
    SELECT status INTO v_status FROM public.agenda_authenticated_entries_test WHERE id='a3c646c2-2e32-4fc5-8728-8e8838b9e008';
    SELECT count(*) INTO v_after FROM public.agenda_coordinator_reviews_test WHERE entry_id='a3c646c2-2e32-4fc5-8728-8e8838b9e008';
    v_ok := v_status='needs_clarification' AND v_after=v_before+1;
    RAISE EXCEPTION 'ROLLBACK_TEST';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM <> 'ROLLBACK_TEST' THEN RAISE EXCEPTION 'INTEGRATION_TEST_ERROR: %',SQLERRM; END IF;
  END;
  IF NOT v_ok THEN RAISE EXCEPTION 'INTEGRATION_TEST_ASSERTION_FAILED'; END IF;
END $$;

DO $$
DECLARE v_ok boolean:=false;
BEGIN
 BEGIN
  PERFORM set_config('request.jwt.claims','{"sub":"c4faeb41-e0b1-4364-8027-b156b6863b31","role":"authenticated"}',true);
  PERFORM public.register_coordinator_decision_test('a3c646c2-2e32-4fc5-8728-8e8838b9e008','needs_clarification','');
 EXCEPTION WHEN OTHERS THEN v_ok := SQLERRM LIKE '%Observation required%'; END;
 IF NOT v_ok THEN RAISE EXCEPTION 'TEST_FAILED: missing observation was accepted'; END IF;
END $$;
