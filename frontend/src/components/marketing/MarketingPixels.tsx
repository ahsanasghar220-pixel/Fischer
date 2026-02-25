import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '@/lib/tracking'
import { captureUtm } from '@/lib/utm'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

/**
 * Loads enabled marketing pixels from the API config endpoint
 * and injects their scripts into the document head.
 * Must be rendered once near the app root.
 */
export default function MarketingPixels() {
  const location = useLocation()

  const { data: config } = useQuery({
    queryKey: ['marketing-config'],
    queryFn: async () => {
      const res = await api.get('/api/marketing/config')
      return res.data as Record<string, Record<string, string>>
    },
    staleTime: 5 * 60 * 1000, // 5 min
    retry: false,
  })

  // Inject pixel scripts once config loads
  useEffect(() => {
    if (!config) return
    injectPixels(config)
  }, [config])

  // Track page views on route change
  useEffect(() => {
    trackPageView()
    captureUtm()
  }, [location.pathname])

  return null
}

function injectPixels(config: Record<string, Record<string, string>>) {
  // Meta Pixel
  if (config.meta?.pixel_id && !window.fbq) {
    const pixelId = config.meta.pixel_id
    const script = document.createElement('script')
    script.innerHTML = `
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
      document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init','${pixelId}');fbq('track','PageView');
    `
    document.head.appendChild(script)
  }

  // Google Analytics (GA4)
  if (config.google_analytics?.measurement_id && !document.querySelector(`script[src*="gtag"]`)) {
    const mid = config.google_analytics.measurement_id
    const s1 = document.createElement('script')
    s1.src = `https://www.googletagmanager.com/gtag/js?id=${mid}`
    s1.async = true
    document.head.appendChild(s1)
    const s2 = document.createElement('script')
    s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${mid}');`
    document.head.appendChild(s2)
  }

  // Google Ads — reuses the gtag script if GA4 already loaded it, otherwise loads it
  if (config.google_ads?.conversion_id) {
    const conversionId = config.google_ads.conversion_id
    const gtagExists = document.querySelector(`script[src*="gtag"]`)

    if (!gtagExists) {
      // Load gtag.js with the Google Ads conversion ID
      const s1 = document.createElement('script')
      s1.src = `https://www.googletagmanager.com/gtag/js?id=${conversionId}`
      s1.async = true
      document.head.appendChild(s1)
      const s2 = document.createElement('script')
      s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${conversionId}');`
      document.head.appendChild(s2)
    } else {
      // gtag already loaded by GA4 — just add the Google Ads config
      const s = document.createElement('script')
      s.innerHTML = `gtag('config','${conversionId}');`
      document.head.appendChild(s)
    }
  }

  // TikTok Pixel
  if (config.tiktok?.pixel_id && !window.ttq) {
    const pixelId = config.tiktok.pixel_id
    const script = document.createElement('script')
    script.innerHTML = `
      !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
      ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
      ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
      for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
      ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
      ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
      ttq.load('${pixelId}');ttq.page();}(window,document,'ttq');
    `
    document.head.appendChild(script)
  }

  // Snapchat Pixel
  if (config.snapchat?.pixel_id && !window.snaptr) {
    const pixelId = config.snapchat.pixel_id
    const script = document.createElement('script')
    script.innerHTML = `
      (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?
      a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];
      var s='script';var r=t.createElement(s);r.async=!0;
      r.src=n;var u=t.getElementsByTagName(s)[0];
      u.parentNode.insertBefore(r,u);})(window,document,'https://sc-static.net/scevent.min.js');
      snaptr('init','${pixelId}',{});
      snaptr('track','PAGE_VIEW');
    `
    document.head.appendChild(script)
  }

  // Pinterest Tag
  if (config.pinterest?.tag_id && !window.pintrk) {
    const tagId = config.pinterest.tag_id
    const script = document.createElement('script')
    script.innerHTML = `
      !function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};
      var n=window.pintrk;n.queue=[];n.version="3.0";
      var t=document.createElement("script");t.async=!0;t.src=e;
      var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}
      ("https://s.pinimg.com/ct/core.js");
      pintrk('load','${tagId}');
      pintrk('page');
    `
    document.head.appendChild(script)
  }
}
