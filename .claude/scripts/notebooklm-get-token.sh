#!/bin/bash
# ============================================================
# NotebookLM - Setup token (da eseguire sul TUO computer)
# ============================================================
# Cosa fa:
#   1. Installa notebooklm-py + browser
#   2. Apre il login Google nel browser
#   3. Stampa il token pronto da copiare in NOTEBOOKLM_AUTH_JSON
# ============================================================
set -euo pipefail

echo ""
echo ">> [1/4] Installo notebooklm-py..."
pip install "notebooklm-py[browser]" --quiet

echo ">> [2/4] Installo il browser Chromium..."
playwright install chromium

echo ">> [3/4] Apro il login Google nel browser..."
echo "   (accedi con il tuo account, poi chiudi/torna qui)"
notebooklm login

echo ">> [4/4] Verifico l'autenticazione..."
if notebooklm auth check --test --json | grep -q '"status": "ok"'; then
  echo ""
  echo "============================================================"
  echo " AUTENTICAZIONE OK"
  echo "============================================================"
  echo ""
  echo " Copia TUTTO il blocco JSON qui sotto e incollalo come"
  echo " valore della variabile NOTEBOOKLM_AUTH_JSON su claude.ai/code:"
  echo ""
  echo "------------------------------------------------------------"
  cat ~/.notebooklm/profiles/default/storage_state.json
  echo ""
  echo "------------------------------------------------------------"
  echo ""
  echo " ATTENZIONE: questo JSON contiene i cookie della tua sessione"
  echo " Google. Non condividerlo pubblicamente."
else
  echo ""
  echo " ERRORE: autenticazione non riuscita."
  echo " Riprova con: notebooklm login"
  exit 1
fi
