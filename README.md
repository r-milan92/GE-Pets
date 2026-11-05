# GE Pets

Statički sajt za GE Pets Renal Guard i Onco Care, sa video-petljom, fotografijama proizvoda i kontakt formom. Izvoz verzije sa brojem telefona +381 11 344 6808.

## Sadržaj

- `index.html` — stranica i kontakt forma.
- `style.css` — stilovi za računar i telefon.
- `app.js` i `contact-delivery.mjs` — navigacija, kontakt forma i obrada odgovora servisa za slanje.
- `assets/` — hero video, naslovna slika, slike pakovanja i logo kompanije.
- `tests/` — provere ponašanja forme bez slanja stvarnih poruka.

## Postavljanje

Raspakujte ZIP i prenesite njegov **sadržaj** u repozitorijum. `index.html` i fascikla `assets/` treba da budu na istom nivou. Za postavljanje na statički hosting nisu potrebni instalacija paketa ni korak za izgradnju. Putanje do slika, stilova i skripti su relativne, pa sajt može da radi i u poddirektorijumu. Sam prenos koda ne uključuje uslugu hostinga.

## Lokalni pregled

U fascikli koja sadrži `index.html` pokrenite `python3 -m http.server 8000` (na Windows-u sa Python pokretačem: `py -m http.server 8000`). Otvorite `http://localhost:8000/` u pregledaču. Koristite lokalni server jer stranica učitava JavaScript module.

## Kontakt

Forma je podešena za slanje preko servisa FormSubmit na **info@internationalhealth.eu**. Dostupnost servisa, aktivacija prijemne adrese i isporuka u sanduče proveravaju se zasebno na adresi na kojoj se sajt koristi. Kada slanje nije potvrđeno, tekst ostaje u formi i može se otvoriti u email aplikaciji. Na dnu forme je i broj **+381 11 344 6808** kao link za poziv.

Ako je instaliran Node.js sa podrškom za `node:test` i `fetch`, komanda `node --test tests/contact-delivery.test.mjs` pokreće lokalne provere forme.
