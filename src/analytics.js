/** Opt-in GA4 analytics. Never uploads save contents, names, player statistics, or editable values. */
import { GA4_MEASUREMENT_ID } from './analytics-config.js';
const KEY = 'gta-save-studio-analytics-consent-v1';
const configured = /^G-[A-Z0-9]{5,16}$/.test(GA4_MEASUREMENT_ID);
let enabled = false;
const allowedEvents = new Set(['save_imported', 'save_exported', 'import_failed']);
const allowedGames = new Set(['III','VC','SA','IV','TLAD','TBOGT']);
function preference() {
  try { return localStorage.getItem(KEY); } catch { return null; }
}
function savePreference(value) {
  try { localStorage.setItem(KEY, value); } catch { /* Private browsing might deny storage. */ }
}
function element() { return document.getElementById('analytics-consent'); }
function removeBanner() { element()?.remove(); }
function startTag() {
  if (enabled || !configured) return;
  enabled = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('consent','default',{
    analytics_storage:'denied', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'
  });
  window.gtag('consent','update',{ analytics_storage:'granted' });
  window.gtag('config',GA4_MEASUREMENT_ID,{
    send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,
    anonymize_ip:true
  });
  const script=document.createElement('script');
  script.async=true;
  script.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_MEASUREMENT_ID)}`;
  script.referrerPolicy='strict-origin-when-cross-origin';
  document.head.appendChild(script);
  trackPageView();
}
export function trackPageView(){
  if(!enabled || typeof window.gtag!=='function')return;
  // Never transmit URL queries or fragment IDs, even if a user pasted something there.
  const pagePath=window.location.pathname;
  window.gtag('event','page_view',{
    page_title:document.title,
    page_location:window.location.origin+pagePath,
    page_path:pagePath
  });
}
export function trackEditorEvent(event,game) {
  if(!enabled || !allowedEvents.has(event) || !allowedGames.has(game))return;
  // Whitelisted metadata only; no filenames, save bytes, mission details, or money.
  window.gtag('event',event,{game_title:game});
}
function showBanner(){
  if(!configured || element())return;
  const banner=document.createElement('div');
  banner.id='analytics-consent';
  banner.className='analytics-consent';
  banner.setAttribute('role','dialog');
  banner.setAttribute('aria-label','Optional website statistics');
  banner.innerHTML=`<div class="analytics-consent-copy"><strong>Optional website statistics</strong><p>Help us see which editor pages are used. If you agree, Google Analytics receives page visits and anonymous editor events — never save files, filenames, or game stats. <a href="privacy.html">Privacy details</a>.</p></div><div class="analytics-consent-actions"><button type="button" class="button button-quiet button-small" data-analytics="deny">No thanks</button><button type="button" class="button button-primary button-small" data-analytics="accept">Allow statistics</button></div>`;
  document.body.appendChild(banner);
}
export function showAnalyticsPreferences(){ if(configured)showBanner(); }
export function initAnalytics(){
  if(!configured)return;
  const status=preference();
  if(status==='accepted')startTag();
  else if(status!=='declined')showBanner();
  document.addEventListener('click',e=>{
    const btn=e.target.closest('[data-analytics]');
    if(!btn)return;
    const accept=btn.dataset.analytics==='accept';
    savePreference(accept?'accepted':'declined');
    removeBanner();
    if(accept)startTag();
    else if(enabled){
      window.gtag?.('consent','update',{analytics_storage:'denied'});
      enabled=false;
      // Persist consent choice. No further analytics events are emitted.
      // Already-created first-party cookies must be cleared through browser controls.
    }
  });
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-analytics-preferences]')){
      e.preventDefault();
      showBanner();
    }
  });
}
