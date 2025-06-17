# dnt-hyttesok

Hyttene til den norske turistforening er stort sett åpen for alle og kan bookes på [DNT sine sider](https://dnt.no). Dessverre er det ikke alltid de er ledig når man ønsker, men det kan være at den jeg håper å leie blir ledig senere som følge av en kansellering.

Hensikten med dette prosjektet er å sende varsel når en DNT hytte jeg ønsker å leie blir ledig. Prosjektet er primært satt opp for egen del, så om du også ønsker å bruke det selv krever det litt oppsett. Det fungerer også for hyttene på Lågøya.

Dette prosjektet benytter [Bun](https://bun.sh/) og er skrevet i [TypeScript](https://www.typescriptlang.org/). Som database benytter jeg [Airtable](https://www.airtable.com/) for å angi hvilken hytte jeg ønsker og hvilket datointervall som er aktuelt. Jobben kjøres jevnlig via [Github Actions](https://docs.github.com/en/actions) for å sjekker om hytta har blitt tilgjengelig. Dersom den har det får jeg en melding på [Slack](https://slack.com/) og dermed også et varsel på mobilen.

Installer avhengigheter via Bun:

```bash
bun install
```

Kjør index.ts:

```bash
bun run index.ts
```
