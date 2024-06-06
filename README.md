# HearMe

## Created by Dejny

Postup jak použít moji aplikaci:

Nejprve musíte vytvořit Spotify aplikaci `https://developer.spotify.com/dashboard/applications`

V aplikaci budete muset nastavit Redirect URIs na: `http://localhost:3000/api/auth/callback/spotify`

Navigujte se do adresáře “HearMe”.
Vytvořte si soubor “.env”.

Do tohoto souboru napíšete `NEXT_PUBLIC_SPOTIFY_CLIENT_ID=''` a do uvozovek vložíte id ze své spotify aplikace. 
Dále napíšete `NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET=''` a do uvozovek vložíte své spotify client secret.
Pomocí aplikace Xampp si vytvoříme databázi v mysql.
V ".env" musíte mít ještě:
```
DATABASE_URL = ''
```
```
SHADOW_DATABASE_URL = ''
```
```
NEXTAUTH_URL="http://localhost:3000"
```
```
NEXTAUTH_SECRET="sem si můžete napsat co chcete"
```
Nainstalujte knihovny pomocí příkazu “npm i”.
Dále vygenerujte Prisma Client pomocí příkazu “npx prisma generate”.
A jako poslední musíte napsat příkaz "npx prisma db push".

Abyste aplikaci spustili, napište příkaz "npm run dev" a na prohlížeči si aplikaci otevřete na adrese "localhost:3000".
