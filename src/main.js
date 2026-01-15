import "./style.css";

// Vejr Widget
const apiNoegle = "7d7d91c7a4a22c8e8bb2501ab77012e9";
const lokationsIkon = `<svg width="7" height="7" viewBox="0 0 7 7" fill="none"><path d="M4.96266 6.44652L6.93774 1.28831C7.00299 1.11706 7.01732 0.930583 6.97899 0.751369C6.94067 0.572154 6.85133 0.407849 6.72174 0.27826C6.59215 0.148671 6.42785 0.0593293 6.24863 0.0210051C6.06942 -0.0173192 5.88294 -0.00299021 5.71169 0.0622647L0.553482 2.03734C0.383822 2.10222 0.239026 2.2191 0.139806 2.37125C0.0405865 2.5234 -0.007975 2.70303 0.00106812 2.88444C0.0101112 3.06586 0.0762957 3.23977 0.190155 3.3813C0.304013 3.52283 0.459714 3.62472 0.634985 3.67241L2.75057 4.24943L3.32759 6.36502C3.37528 6.54029 3.47717 6.69599 3.6187 6.80985C3.76023 6.9237 3.93414 6.98989 4.11556 6.99893C4.29697 7.00797 4.4766 6.95941 4.62875 6.86019C4.7809 6.76097 4.89778 6.61618 4.96266 6.44652Z" fill="#629F9E"/></svg>`;

// Kortlæg OpenWeather betingelseskoder til ikon filnavne
function getVejrIkonFil(vejrKode, vejrHoved) {
  // Klar himmel
  if (vejrKode === 800) return "sol.svg";

  // Få skyer (few clouds) - sol med skyer
  if (vejrKode === 801) return "somMedSkyer.svg";

  // Spredte skyer (scattered clouds)
  if (vejrKode === 802) return "gra_sky.svg";

  // Brudte/overskyet skyer (broken/overcast clouds)
  if (vejrKode >= 803 && vejrKode <= 804) return "overskyet.svg";

  // Tordenvejr
  if (vejrKode >= 200 && vejrKode < 300) return "Torden.svg";

  // Støvregn (drizzle)
  if (vejrKode >= 300 && vejrKode < 400) {
    return "Regn.svg";
  }

  // Regn
  if (vejrKode >= 500 && vejrKode < 600) {
    // Tjek om det er regn med sol (typisk code 500-511)
    if (vejrKode >= 500 && vejrKode <= 511) {
      return "SolMedSkyOgRegn.svg";
    }
    return "Regn.svg";
  }

  // Sne
  if (vejrKode >= 600 && vejrKode < 700) return "SneOgSlud.svg";

  // Atmosfære (tåge, dis, osv.) eller vind
  if (vejrKode >= 700 && vejrKode < 800) return "vind.svg";

  // Standard til sky
  return "overskyet.svg";
}

async function hentVejrData(breddegrad, laengdegrad, by) {
  const url = breddegrad
    ? `https://api.openweathermap.org/data/2.5/weather?lat=${breddegrad}&lon=${laengdegrad}&appid=${apiNoegle}&units=metric`
    : `https://api.openweathermap.org/data/2.5/weather?q=${by}&appid=${apiNoegle}&units=metric`;
  const svar = await fetch(url);
  if (!svar.ok) throw new Error("Fejl");
  return await svar.json();
}

function visVejr(data) {
  const widget = document.getElementById("vejeret");
  if (!widget) return;

  // Få det passende vejrikon filnavn
  const vejrKode = data.weather[0].id;
  const vejrHoved = data.weather[0].main;
  const ikonFil = getVejrIkonFil(vejrKode, vejrHoved);

  widget.innerHTML = `
        <section class="vejrInfo">
            <div class="vejrLokation">
                <span class="byNavn">${data.name}</span>
                <span class="lokationsIkon">${lokationsIkon}</span>
            </div>
            <div class="temperatur">${Math.round(
              data.main.temp_min
            )}°/${Math.round(data.main.temp_max)}°C</div>
        </section>
        <div class="vejrIkon">
            <img src="public/vejr/${ikonFil}" alt="vejr ikon">
        </div>
    `;
}

function initVejr() {
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const data = await hentVejrData(
          position.coords.latitude,
          position.coords.longitude
        );
        visVejr(data);
      } catch {
        const data = await hentVejrData(null, null, "Copenhagen");
        visVejr(data);
      }
    },
    async () => {
      const data = await hentVejrData(null, null, "Copenhagen");
      visVejr(data);
    }
  );
}

// Tema Skift Funktionalitet
function initTemaSkift() {
  const temaSkiftKnap = document.getElementById("temaSkift");
  const appSektion = document.querySelector(".app[data-tema]");
  const temaIkon = document.querySelector(".temaIkon");
  const temaTekst = document.querySelector(".temaTekst");

  if (!temaSkiftKnap || !appSektion) return;

  // Tjek om der er gemt et tema i localStorage
  const gemtTema = localStorage.getItem("tema") || "light";
  appSektion.setAttribute("data-tema", gemtTema);
  opdaterKnapTekst(gemtTema);

  // Toggle mellem light og dark mode
  temaSkiftKnap.addEventListener("click", () => {
    const aktuelTema = appSektion.getAttribute("data-tema");
    const nytTema = aktuelTema === "light" ? "dark" : "light";

    appSektion.setAttribute("data-tema", nytTema);
    localStorage.setItem("tema", nytTema);
    opdaterKnapTekst(nytTema);
  });

  function opdaterKnapTekst(tema) {
    if (tema === "dark") {
      temaTekst.textContent = "Light Mode";
      const iosBar = document.getElementById("iosBar");
      if (iosBar) {
        iosBar.src = "public/iosBarDark.svg";
      }
    } else {
      temaTekst.textContent = "Dark Mode";
      const iosBar = document.getElementById("iosBar");
      if (iosBar) {
        iosBar.src = "public/iosBar.svg";
      }
    }
  }
}

// Initialiser alt når DOM er klar
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initVejr();
    initTemaSkift();
  });
} else {
  initVejr();
  initTemaSkift();
}
