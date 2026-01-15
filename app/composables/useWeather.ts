import { ref } from 'vue'

// Map des codes météo WMO vers des icônes et libellés
const weatherCodeMap: Record<number, { icon: string; label: string }> = {
  0: { icon: 'lucide:sun', label: 'Ciel clair' },
  1: { icon: 'lucide:cloud-sun', label: 'Peu nuageux' },
  2: { icon: 'lucide:cloud', label: 'Nuageux' },
  3: { icon: 'lucide:cloudy', label: 'Très nuageux' },
  45: { icon: 'lucide:fog', label: 'Brouillard' },
  48: { icon: 'lucide:fog', label: 'Brouillard givrant' },
  51: { icon: 'lucide:cloud-drizzle', label: 'Bruine légère' },
  53: { icon: 'lucide:cloud-drizzle', label: 'Bruine' },
  55: { icon: 'lucide:cloud-drizzle', label: 'Bruine forte' },
  61: { icon: 'lucide:cloud-rain', label: 'Pluie faible' },
  63: { icon: 'lucide:cloud-rain', label: 'Pluie' },
  65: { icon: 'lucide:cloud-rain-wind', label: 'Pluie forte' },
  71: { icon: 'lucide:cloud-snow', label: 'Neige faible' },
  73: { icon: 'lucide:cloud-snow', label: 'Neige' },
  75: { icon: 'lucide:cloud-snow', label: 'Forte neige' },
  80: { icon: 'lucide:cloud-lightning', label: 'Averses' },
  81: { icon: 'lucide:cloud-lightning', label: 'Averses' },
  82: { icon: 'lucide:cloud-lightning', label: 'Averses violentes' },
  95: { icon: 'lucide:tornado', label: 'Orage' },
  96: { icon: 'lucide:tornado', label: 'Orage et grêle' },
  99: { icon: 'lucide:tornado', label: 'Orage et grêle' },
}

export const useWeather = () => {
  const user = usePocketBaseUser()
  const weather = ref({
    temp: '...',
    icon: 'lucide:loader-2',
    label: 'Météo...',
    city: ''
  })
  const loading = ref(false)

  const fetchWeather = async () => {
    if (loading.value) return
    loading.value = true
    
    // Coordonnées par défaut : Paris
    let lat = 48.85
    let lon = 2.35
    let cityName = 'Paris'

    try {
      // 1. Vérifie si l'utilisateur a une ville dans son profil
      if (user.value?.city) {
        // API gratuite du gouvernement pour trouver les coordonnées d'une ville française
        const geoUrl = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(user.value.city)}&limit=1`
        const geoRes: any = await $fetch(geoUrl)
        
        if (geoRes.features && geoRes.features.length > 0) {
          lon = geoRes.features[0].geometry.coordinates[0]
          lat = geoRes.features[0].geometry.coordinates[1]
          cityName = geoRes.features[0].properties.city
        }
      }

      // 2. Récupère la météo depuis l'API gratuite Open-Meteo
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      const weatherRes: any = await $fetch(weatherUrl)

      if (weatherRes.current_weather) {
        const code = weatherRes.current_weather.weathercode
        const mapped = weatherCodeMap[code] || { icon: 'lucide:thermometer-sun', label: 'Météo' }
        
        weather.value = {
          temp: Math.round(weatherRes.current_weather.temperature).toString(),
          icon: mapped.icon,
          label: mapped.label,
          city: cityName
        }
      }
    } catch (e) {
      console.error("Erreur de récupération de la météo:", e)
      weather.value.label = 'Erreur météo'
      weather.value.icon = 'lucide:alert-triangle'
    } finally {
      loading.value = false
    }
  }

  return { weather, loading, fetchWeather }
}