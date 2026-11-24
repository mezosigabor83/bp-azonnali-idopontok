# Budapest Pszichológia időpontkereső

1. Hozz létre egy nyilvános GitHub-tárolót `bp-azonnali-idopontok` néven. A csomag fájljai kerüljenek a gyökérbe a `.github` mappával együtt. A tárolóba ne kerüljenek ügyféladatok vagy belépési adatok.
2. A tárolóban nyisd meg a **Settings → Pages** menüt. A **Source** mezőben válaszd a **GitHub Actions** lehetőséget.
3. Az **Actions → Szabad időpontok frissítése** alatt indítsd el a **Run workflow** gombbal az első futást. Sikeres futás után a **Settings → Pages** mutatja a megnyitható címet.
4. A `ghl-beagyazas.txt` fájlban cseréld ki az iframe címét a megjelenő Pages-címre. Illeszd a kódot a GHL próbaoldal Custom HTML/Javascript blokkjába, és az előnézetben ellenőrizd mind a négy rendelőt és a profilokra mutató linkeket.
5. Az ellenőrzés után a GHL-ben publikáld a keresőt, és a GHL végleges linkjét add át Bálintnak.

A frissítő óránként, minden óra 23. percére ütemezve fut. Ha hiányos egy futás, az előző közzétett lista marad elérhető. Hat óránál régebbi adatok esetén az oldal átmeneti elérhetetlenséget jelez. A frissítő az ellenőrzött előnézeti profilokról olvassa a foglalási linkeket, a látogató az éles profilcímre jut.
