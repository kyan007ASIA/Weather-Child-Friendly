import { KidWeatherInterpretation } from '../types/weather';

export function interpretWeatherForKids(
  weatherCode: number,
  tempC: number,
  isDay: number = 1,
  windSpeed: number = 0,
  rainProb: number = 0
): KidWeatherInterpretation {
  // Mascot classification
  let mascotType: 'sunny' | 'rainy' | 'snowy' | 'cloudy' = 'sunny';
  let simpleTitle = 'Bright & Sunny';
  let tagline = 'The sun is smiling down today!';
  let playScore = 95;
  let playAdvice = 'Perfect day for the playground, riding bikes, and running around!';
  let scienceFunFact = 'Did you know? Sunlight takes about 8 minutes and 20 seconds to travel all the way from the Sun to Earth!';

  // Weather Code logic based on WMO codes
  if (weatherCode === 0) {
    if (isDay) {
      simpleTitle = 'Bright Sunshine! ☀️';
      tagline = 'Clear blue skies with lots of warm golden sunshine.';
      mascotType = 'sunny';
      playScore = 98;
      playAdvice = 'Super day for outdoor sports, hide & seek, or a picnic!';
      scienceFunFact = 'The sun is a giant ball of glowing gas! Over one million Earths could fit inside it.';
    } else {
      simpleTitle = 'Clear Starlit Night! ✨';
      tagline = 'Crystal clear skies with twinkling stars.';
      mascotType = 'cloudy';
      playScore = 70;
      playAdvice = 'Great night to look up and spot stars or the moon through your window!';
      scienceFunFact = 'On a clear dark night without city lights, you can see about 2,500 stars with just your eyes!';
    }
  } else if (weatherCode === 1 || weatherCode === 2) {
    simpleTitle = 'Partly Cloudy with Peeking Sun ⛅';
    tagline = 'Soft fluffy white clouds playing peek-a-boo with the sun!';
    mascotType = 'sunny';
    playScore = 92;
    playAdvice = 'Awesome outdoor weather! You can play tag or find funny shapes in the clouds.';
    scienceFunFact = 'Clouds look like cotton candy, but they are actually floating droplets of water and ice!';
  } else if (weatherCode === 3) {
    simpleTitle = 'Big Cozy Grey Clouds ☁️';
    tagline = 'The sky has put on a thick blanket of grey clouds.';
    mascotType = 'cloudy';
    playScore = 80;
    playAdvice = 'Nice cool air for scootering or playing soccer before any raindrops start!';
    scienceFunFact = 'A single average fluffy cumulus cloud can weigh over 1 million pounds — as heavy as 100 elephants!';
  } else if (weatherCode >= 45 && weatherCode <= 48) {
    simpleTitle = 'Misty & Foggy Morning 🌫️';
    tagline = 'Like walking right through a cloud on the ground!';
    mascotType = 'cloudy';
    playScore = 65;
    playAdvice = 'Dress warm with bright colors so you can be easily seen. Good for gentle walks!';
    scienceFunFact = 'Fog is literally just a cloud that touches the ground!';
  } else if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
    simpleTitle = 'Rainy Puddle Weather! 🌧️';
    tagline = 'Water droplets are splashing from the clouds!';
    mascotType = 'rainy';
    playScore = 55;
    playAdvice = 'Grab your rain boots for puddle jumping, or build an indoor blanket fort!';
    scienceFunFact = 'Raindrops fall at speeds of up to 20 miles per hour! Smells fresh? That smell is called petrichor.';
  } else if ((weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86)) {
    simpleTitle = 'Magical Snow Day! ❄️';
    tagline = 'Soft white snowflakes drifting down from the sky!';
    mascotType = 'snowy';
    playScore = 85;
    playAdvice = 'Bundle up tight! Time to build snowmen, make snow angels, or have a snowball toss!';
    scienceFunFact = 'No two snowflakes are exactly identical! Each snowflake has six intricate symmetrical arms.';
  } else if (weatherCode >= 95) {
    simpleTitle = 'Rumbling Thunderstorm! ⛈️';
    tagline = 'Booming thunder and flashing lightning!';
    mascotType = 'rainy';
    playScore = 20;
    playAdvice = 'Stay cozy indoors! Great time for board games, reading storybooks, and hot cocoa.';
    scienceFunFact = 'Lightning is 5 times hotter than the surface of the sun! Thunder is the sound of air expanding super fast.';
  }

  // Adjust play advice for high winds
  if (windSpeed > 30) {
    playScore = Math.max(30, playScore - 25);
    playAdvice += ' High winds today — hold onto your hat tightly!';
  } else if (windSpeed > 15 && mascotType !== 'rainy') {
    playAdvice += ' Great breezy breeze for flying a kite! 🪁';
  }

  // Temperature descriptions
  let kidFriendlyTempFeeling = 'Just Right!';
  if (tempC < 0) {
    kidFriendlyTempFeeling = 'Freezing Cold! 🥶';
  } else if (tempC < 10) {
    kidFriendlyTempFeeling = 'Brrr, Very Chilly! 🧤';
  } else if (tempC < 17) {
    kidFriendlyTempFeeling = 'Crisp & Cool! 🧥';
  } else if (tempC < 24) {
    kidFriendlyTempFeeling = 'Super Comfy & Pleasant! 😊';
  } else if (tempC < 30) {
    kidFriendlyTempFeeling = 'Warm & Toasty! ☀️';
  } else {
    kidFriendlyTempFeeling = 'Super Hot! Stay Hydrated! 🍦';
  }

  // Wardrobe / Clothing helper
  const clothingSuggestions: KidWeatherInterpretation['clothingSuggestions'] = [];

  if (tempC < 5 || mascotType === 'snowy') {
    clothingSuggestions.push({ name: 'Warm Winter Coat', icon: '🧥', importance: 'must-have' });
    clothingSuggestions.push({ name: 'Beanie & Scarf', icon: '🧣', importance: 'must-have' });
    clothingSuggestions.push({ name: 'Mittens or Gloves', icon: '🧤', importance: 'must-have' });
    clothingSuggestions.push({ name: 'Snow Boots', icon: '🥾', importance: 'must-have' });
  } else if (tempC < 15) {
    clothingSuggestions.push({ name: 'Cozy Jacket or Hoodie', icon: '🧥', importance: 'must-have' });
    clothingSuggestions.push({ name: 'Long Pants / Jeans', icon: '👖', importance: 'must-have' });
    clothingSuggestions.push({ name: 'Sneakers & Warm Socks', icon: '👟', importance: 'must-have' });
  } else if (tempC < 23) {
    clothingSuggestions.push({ name: 'Light Cardigan or Long Sleeve', icon: '👕', importance: 'good-idea' });
    clothingSuggestions.push({ name: 'Comfortable Pants', icon: '👖', importance: 'must-have' });
    clothingSuggestions.push({ name: 'Walking Shoes', icon: '👟', importance: 'must-have' });
  } else {
    clothingSuggestions.push({ name: 'Cool Cotton T-Shirt', icon: '👕', importance: 'must-have' });
    clothingSuggestions.push({ name: 'Shorts or Summer Dress', icon: '🩳', importance: 'must-have' });
    clothingSuggestions.push({ name: 'Sun Hat', icon: '🧢', importance: 'good-idea' });
    clothingSuggestions.push({ name: 'Sunglasses', icon: '🕶️', importance: 'optional' });
  }

  if (mascotType === 'rainy' || rainProb > 40) {
    clothingSuggestions.unshift({ name: 'Waterproof Raincoat', icon: '🦺', importance: 'must-have' });
    clothingSuggestions.push({ name: 'Rain Boots', icon: '👢', importance: 'must-have' });
    clothingSuggestions.push({ name: 'Yellow Umbrella', icon: '☂️', importance: 'good-idea' });
  }

  // Theme colors
  let accentColor = '#0284c7';
  let bgColor = 'from-sky-100 to-amber-50';
  let borderColor = 'border-sky-200';

  if (mascotType === 'sunny') {
    accentColor = '#eab308';
    bgColor = 'from-amber-50 via-sky-50 to-emerald-50';
    borderColor = 'border-amber-200';
  } else if (mascotType === 'rainy') {
    accentColor = '#0284c7';
    bgColor = 'from-blue-50 via-sky-50 to-indigo-50';
    borderColor = 'border-blue-200';
  } else if (mascotType === 'snowy') {
    accentColor = '#38bdf8';
    bgColor = 'from-cyan-50 via-slate-50 to-blue-50';
    borderColor = 'border-cyan-200';
  } else if (mascotType === 'cloudy') {
    accentColor = '#64748b';
    bgColor = 'from-slate-50 via-sky-50 to-indigo-50';
    borderColor = 'border-slate-200';
  }

  return {
    simpleTitle,
    tagline,
    mascotType,
    accentColor,
    bgColor,
    borderColor,
    playScore,
    playAdvice,
    clothingSuggestions,
    kidFriendlyTempFeeling,
    scienceFunFact,
  };
}

export function formatDayName(dateString: string, index: number): string {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

export function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}
