#!/bin/bash




RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'

CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'

RESET='\033[0m'



sensitive_keywords=("password" "secret" "token" "apiKey" "api_key" "private" "balance" "ssn" "credit_card")

public_count=0

auth_count=0
notfound_count=0


leak_count=0

print_header() {

    
    echo -e "${CYAN}${BOLD}"

    echo "API ENDPOINT SCANNER — VulnCheck"           

    echo -e "${RESET}"
    echo -e "${BLUE}Target:${RESET} $1"

    echo -e "${BLUE}Started:${RESET} $(date)"
    echo ""

}

print_divider() {
    echo -e "${CYAN}────────────────────────────────────────────────────────────${RESET}"
}

# Pretty-print JSON if possible, else raw

pretty_body() {
    local body="$1"
    if command -v jq >/dev/null 2>&1 && echo "$body" | jq empty >/dev/null 2>&1; then
        echo "$body" | jq .
    else
        echo "$body"
    fi
}

scan_one() {
    local url=$1
    local status body

    status=$(curl -s -o /dev/null -w "%{http_code}" -L --max-time 4 "$url")

    body=$(curl -s -L --max-time 4 "$url")

    print_divider


    echo -e "${BOLD} $url${RESET}"

    case "$status" in

        200)
            echo -e "  Status: ${GREEN}${BOLD}$status OK — PUBLIC${RESET}"

            public_count=$(( public_count + 1 ))


            echo -e "  ${MAGENTA}Content:${RESET}"

            pretty_body "$body" | sed 's/^/    /'


            local found_leak=false
            for key in "${sensitive_keywords[@]}"; do
                if grep -qi "$key" <<< "$body"; then


                    echo -e "  ${RED}${BOLD}⚠ LEAK WARNING:${RESET} sensitive keyword '${RED}$key${RESET}' found in response!"
                    found_leak=true
                fi
                
            done
            if [ "$found_leak" = true ]; then

                leak_count=$(( leak_count + 1 ))
            fi
            ;;
        401|403)


            echo -e "  Status: ${YELLOW}${BOLD}$status — AUTHENTICATED / PROTECTED${RESET}"

            echo -e "  ${YELLOW}This endpoint requires authentication. Content hidden (as expected).${RESET}"

            auth_count=$(( auth_count + 1 ))
            ;;
        404)

            echo -e "  Status: ${BLUE}$status — NOT FOUND${RESET}"
            notfound_count=$(( notfound_count + 1 ))
            ;;
        000)

            echo -e "  Status: ${RED}CONNECTION FAILED${RESET} (server unreachable or timed out)"
            ;;
        *)

            echo -e "  Status: ${MAGENTA}$status${RESET}"
            ;;
    esac

    echo ""
}


print_summary() {
    print_divider
    echo -e "${CYAN}${BOLD}SCAN SUMMARY${RESET}"

    echo -e "  ${GREEN}Public endpoints (200):${RESET}        $public_count"

    echo -e "  ${YELLOW}Authenticated/Protected (401/403):${RESET} $auth_count"


    echo -e "  ${BLUE}Not Found (404):${RESET}               $notfound_count"
    echo -e "  ${RED}Endpoints leaking sensitive data:${RESET}  $leak_count"



    echo -e "  Completed: $(date)"
    print_divider
}



read -p "Enter target base URL (exmple::  http://localhost:8000 / https://nexorbite.com): " base_url


read -p "inter a sparate endpoints use commans:: (leave blank for defaults): " custom_endpoints

if [ -z "$custom_endpoints" ]; then

#commen emdpoints
    endpoints=("/api/health" "/api/users" "/api/admin" "/api/login" "/api/config" "/api/admin/dashboard" "/api/user/profile" "/random-fake-route")
else
    IFS=',' read -ra endpoints <<< "$custom_endpoints"

fi

print_header "$base_url"



for ep in "${endpoints[@]}"; do

    ep_trimmed=$(echo "$ep" | xargs)  # trim whitespace
    scan_one "${base_url}${ep_trimmed}"

done



print_summary