const btn = document.querySelector('.talk');
const content = document.querySelector('.content');
const commandList = document.getElementById('commandList');
const showCommandsBtn = document.getElementById('showCommandsBtn');
const modal = document.getElementById('commandModal');
const closeBtn = document.getElementsByClassName('close')[0];

const commands = [
    'open [website]',
    'what is [query]',
    'who is [query]',
    'wikipedia [query]',
    'time',
    'date',
    'calculator',
    'weather in [location]',
    'stock price of [symbol]',
    'set reminder [text]',
    'show notes',
    'delete note [id]',
    'translate [text] to [language]',
    'movie recommendations for [genre]',
    'tell me a joke',
    'random quote',
    'calculate bmi [weight] [height]',
    'generate password [length]',
    'set timer for [duration]',
    'play music'
];

commands.forEach(command => {
    const li = document.createElement('li');
    li.textContent = command;
    commandList.appendChild(li);
});

showCommandsBtn.onclick = function() {
    modal.style.display = "block";
}

closeBtn.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function speak(text) {
    const text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 0.9;
    text_speak.volume = 1;
    text_speak.pitch = 0.3;
    window.speechSynthesis.speak(text_speak);
}

function wishMe() {
    const day = new Date();
    const hour = day.getHours();

    if (hour >= 0 && hour < 12) {
        speak("  good Good Morning Master...");
    } else if (hour > 12 && hour < 17) {
        speak("  good Good Afternoon Master...");
    } else {
        speak(" good Good Evening master...");
    }
}

window.addEventListener('load', () => {
    speak("  good system on and ready to go" );
    wishMe();
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onresult = (event) => {
    const current = event.resultIndex;
    const transcript = event.results[current][0].transcript;
    content.textContent = transcript;
    takeCommand(transcript.toLowerCase());
}

btn.addEventListener('click', () => {

    speak("  good i'm listening " );
    recognition.start();
});

async function takeCommand(message) {
    if (message.includes('hey') || message.includes('hello')) {
        speak(" good Hello Master, How May I Help You?");
    }
    else if (message.includes('open')) {
        const site = message.split('open ')[1];
        window.open(`https://${site}.com`, "_blank");
        speak(` good Opening ${site}...`);
    }
    else if (message.includes('what is') || message.includes('who is') || message.includes('what are')) {
        window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
        const finalText = "  good This is what I found on the internet regarding " + message;
        speak(finalText);
    }
    else if (message.includes('wikipedia')) {
        window.open(`https://en.wikipedia.org/wiki/${message.replace("wikipedia", "")}`, "_blank");
        const finalText = "  good This is what I found on Wikipedia regarding " + message;
        speak(finalText);
    }
    else if (message.includes('time')) {
        const time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" })
        const finalText = time;
        speak(finalText);
    }
    else if (message.includes('date')) {
        const date = new Date().toLocaleString(undefined, { month: "short", day: "numeric" })
        const finalText = date;
        speak(finalText);
    }
    else if (message.includes('calculator')) {
        window.open('Calculator:///')
        const finalText = "  good Opening Calculator";
        speak(finalText);
    }
    else if (message.includes('weather in')) {
        const weather = await getWeatherInfo(message.split('weather in ')[1]);
        speak(weather);
    }
    else if (message.includes('stock price of')) {
        const stock = await getStockPrice(message.split('stock price of ')[1]);
        speak(stock);
    }
    else if (message.includes('set reminder')) {
        const reminder = setReminder(message.split('set reminder ')[1]);
        speak(reminder);
    }
    else if (message.includes('show notes')) {
        const notes = getNotes();
        speak(notes);
    }
    else if (message.includes('delete note')) {
        const noteId = parseInt(message.split('delete note ')[1]);
        const result = deleteNote(noteId);
        speak(result);
    }
    else if (message.includes('translate')) {
        const [text, targetLang] = message.split(' to ');
        const translation = await translateText(text.replace('translate ', ''), targetLang);
        speak(translation);
    }
    else if (message.includes('movie recommendations for')) {
        const genre = message.split('movie recommendations for ')[1];
        const recommendations = await getMovieRecommendations(genre);
        speak(recommendations);
    }
    else if (message.includes('tell me a joke')) {
        const joke = await getRandomJoke();
        speak(joke);
    }
    else if (message.includes('random quote')) {
        const quote = getRandomQuote();
        speak(quote);
    }
    else if (message.includes('calculate bmi')) {
        const [, weight, height] = message.split(' ');
        const bmi = calculateBMI(parseFloat(weight), parseFloat(height));
        speak(bmi);
    }
    else if (message.includes('generate password')) {
        const length = parseInt(message.split('generate password ')[1]) || 12;
        const password = generatePassword(length);
        speak(password);
    }
    else if (message.includes('set timer for')) {
        const duration = message.split('set timer for ')[1];
        setTimer(duration);
    }
    else if (message.includes('play music')) {
        playMusic();
    }
    else {
        window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
        const finalText = "  good I found some information for " + message + " on Google";
        speak(finalText);
    }
}

async function getWeatherInfo(location) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${config.WEATHER_API_KEY}&units=metric`);
        if (!response.ok) {
            throw new Error(`Weather API responded with status: ${response.status}`);
        }
        const data = await response.json();
        return `The weather in ${location} is ${data.weather[0].description} with a temperature of ${data.main.temp}°C`;
    } catch (error) {
        console.error('Error in getWeatherInfo:', error);
        return "  good I'm sorry, I couldn't fetch the weather information at the moment.";
    }
}

async function getStockPrice(symbol) {
    try {
        const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${config.FINNHUB_API_KEY}`);
        if (!response.ok) {
            throw new Error(`Stock API responded with status: ${response.status}`);
        }
        const data = await response.json();
        return `The current stock price of ${symbol} is $${data.c}`;
    } catch (error) {
        console.error('Error in getStockPrice:', error);
        return "  good I'm sorry, I couldn't fetch the stock price at the moment.";
    }
}

function setReminder(reminderText) {
    const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    reminders.push(reminderText);
    localStorage.setItem('reminders', JSON.stringify(reminders));
    return `Reminder set: ${reminderText}`;
}

function getNotes() {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    if (notes.length === 0) {
        return "You don't have any saved notes.";
    }
    return notes.map((note, index) => `Note ${index + 1}: ${note}`).join('. ');
}

function deleteNote(id) {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    if (id < 1 || id > notes.length) {
        return "Invalid note ID. Please check the ID and try again.";
    }
    const deletedNote = notes.splice(id - 1, 1)[0];
    localStorage.setItem('notes', JSON.stringify(notes));
    return `Note deleted: ${deletedNote}`;
}

async function translateText(text, targetLanguage) {
    try {
        const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${config.GOOGLE_TRANSLATE_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                target: targetLanguage
            })
        });
        if (!response.ok) {
            throw new Error(`Translation API responded with status: ${response.status}`);
        }
        const data = await response.json();
        return `Translated text: ${data.data.translations[0].translatedText}`;
    } catch (error) {
        console.error('Error in translateText:', error);
        return "I'm sorry, I couldn't translate the text at the moment.";
    }
}

async function getMovieRecommendations(genre) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${config.TMDB_API_KEY}&with_genres=${genre}&sort_by=popularity.desc&page=1`);
        if (!response.ok) {
            throw new Error(`TMDB API responded with status: ${response.status}`);
        }
        const data = await response.json();
        const movies = data.results.slice(0, 5).map(movie => movie.title).join(', ');
        return `Here are some movie recommendations for ${genre}: ${movies}`;
    } catch (error) {
        console.error('Error in getMovieRecommendations:', error);
        return "I'm sorry, I couldn't fetch movie recommendations at the moment.";
    }
}

async function getRandomJoke() {
    try {
        const response = await fetch('https://official-joke-api.appspot.com/random_joke');
        if (!response.ok) {
            throw new Error(`Joke API responded with status: ${response.status}`);
        }
        const data = await response.json();
        return `${data.setup} ${data.punchline}`;
    } catch (error) {
        console.error('Error in getRandomJoke:', error);
        return "I'm sorry, I couldn't fetch a joke at the moment.";
    }
}

function getRandomQuote() {
    const quotes = [
        { text: " good The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: " good Life is what happens when you're busy making other plans.", author: "John Lennon" },
        { text: " good The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
        { text: " good Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
        { text: " good The best way to predict the future is to invent it.", author: "Alan Kay" }
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    return `${randomQuote.text} - ${randomQuote.author}`;
}

function calculateBMI(weight, height) {
    const bmi = weight / ((height / 100) ** 2);
    let category;
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 25) category = "Normal weight";
    else if (bmi < 30) category = "Overweight";
    else category = "Obese";
    return `  good Your BMI is ${bmi.toFixed(1)}. Category: ${category}`;
}

function generatePassword(length = 12) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return ` good Generated password: ${password}`;
}

function setTimer(duration) {
    const durationInMs = parseDuration(duration);
    speak(`Timer set for ${duration}`);
    setTimeout(() => {
        speak("Timer finished!");
    }, durationInMs);
}

function parseDuration(duration) {
    const parts = duration.split(' ');
    let totalMs = 0;
    for (let i = 0; i < parts.length; i += 2) {
        const value = parseInt(parts[i]);
        const unit = parts[i + 1].toLowerCase();
        switch (unit) {
            case 'second':
            case 'seconds':
                totalMs += value * 1000;
                break;
            case 'minute':
            case 'minutes':
                totalMs += value * 60000;
                break;
            case 'hour':
            case 'hours':
                totalMs += value * 3600000;
                break;
        }
    }
    return totalMs;
}

function playMusic() {
    // This is a placeholder. In a real application, you would integrate with a music API or local audio player.
    speak("Playing music. This is a placeholder for actual music playback.");
}

