# dnt-hyttesok

Hensikten med dette prosjektet er å jevnlig søke etter ledige DNT hytter. Som regel blir hytter som allerede er booket ledige som følge av kanselleringer. Prosjektet er primært laget for egen del og om du ønsker bruke dette krever det litt justeringer. Som database benytter jeg Airtable for å angi hvilken hytte jeg ønsker og hvilket datointervall som er aktuelt. Ved å kjøre index.ts jevnlig sjekker jeg om hytta blir tilgjengelig i perioden jeg har satt opp. Dersom hytta blir ledig får jeg en melding på slack.

Installer avhengigheter via Bun:

```bash
bun install
```

Kjør index.ts:

```bash
bun run index.ts
```
