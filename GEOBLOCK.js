(async function geoRedirect() {
  const REDIRECT_URL = 'https://geo.antviz.ru';
  const blockedCountries = ['IR','AF','IQ','UA','NG','NE','MX','SA','JO','PK','IN','MM','BD','NP','BT','OM','YE','QA','KW','BH','CD','CG','DZ'];

  function redirect() {
    window.location.replace(REDIRECT_URL);
  }

  try {
    const res = await fetch('https://api.country.is/', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data.country && blockedCountries.includes(data.country)) {
        redirect();
        return;
      }
    }
  } catch (_) {}

  try {
    const res = await fetch('https://ipwho.is/?fields=country_code', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data.country_code && blockedCountries.includes(data.country_code)) {
        redirect();
        return;
      }
    }
  } catch (_) {}
})();
