/* Configurazione dell'app.
   serviceUrl: indirizzo del servizio centrale (Google Apps Script, codice in sync/piccoli-passi-sync.gs)
   che offre a tutte le famiglie la condivisione cifrata e le notizie sugli eventi della zona,
   senza che ognuno debba creare un servizio proprio. Lascialo vuoto ("") per non usarlo:
   ogni famiglia potrà comunque collegare un proprio servizio da Impostazioni. */
window.PP_CONFIG = {
  serviceUrl: "https://script.google.com/macros/s/AKfycbyYyrqEHCkuzaKjzKec1vhrbR5Q3BLiSxt2w3buCtFcL9kQjTBzO3NpE4ON1c19VEeWAw/exec",
  // indirizzi usati prima (stesso account Google, stessi dati): i telefoni collegati lì passano da soli a serviceUrl
  previousServiceUrls: [
    "https://script.google.com/macros/s/AKfycbzhPsIpZsoIMkSih0SzoZFCIjdrotUf9mtx_4PrmRyc6BFeiCeQBF1Z5J0VhpNPeiEHNg/exec",
    "https://script.google.com/macros/s/AKfycbzsIjgEKf_XcFkUvJL0QJI2EPBEz3welOMM5DkNrSL4w27L06fK9Q8K5m6wPZMfFQB8Pg/exec"
  ]
};
