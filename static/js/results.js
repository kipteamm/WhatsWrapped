// Retrieve the Base64-encoded data from the query parameter
const urlParams = new URLSearchParams(window.location.search);
const base64Encoded = urlParams.get('d');

// Step 1: Ensure the Base64 string is URL-safe (reverse the encoding)
let base64Decoded = base64Encoded.replace(/-/g, '+').replace(/_/g, '/');

// Step 2: Decode the Base64 string back to a byte array
const decodedString = atob(base64Decoded);

// Step 3: Convert the decoded string back to a UTF-8 byte array
const utf8BytesDecoded = new Uint8Array(decodedString.split('').map(c => c.charCodeAt(0)));

// Step 4: Use TextDecoder to decode the byte array back into a UTF-8 string
const decoder = new TextDecoder();
const decodedDataString = decoder.decode(utf8BytesDecoded);

// Step 5: Parse the decoded string into a JavaScript object
const data = JSON.parse(decodedDataString);

if (document.readyState !== 'loading') {
    dataInit();
} else {
    document.addEventListener('DOMContentLoaded', function () {
        dataInit();
    });
}

let pages = [0, 1, 2, 4, 5, 6, 11, 12, 15];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const textAnimations = ["first", "second", "third", "fourth", "fifth", "sixth"]
const today = new Date();

function dataInit() {
    detectSwipeUp(document.body);
    
    data.messages_per_participant.forEach(participant => {
        document.getElementById("participants").innerHTML += `<h2 class="first">${participant[0]}<div class="layer-0"></div><div class="layer layer-1"></div><div class="layer layer-2"></div><div class="layer layer-3"></div></h2>`;
    });
    document.getElementById("total").innerHTML = data.total;

    if (data.best_day.date) {
        document.getElementById("best_day_date").innerHTML = formatDate(data.best_day.date);
        document.getElementById("best_day_messages").innerHTML = data.best_day.messages;
        pages.push(3);
    }

    document.getElementById("most_active_day").innerHTML = days[data.days[0][0]] + "s";
    dayChart();
    document.getElementById("most_active_month").innerHTML = months[data.months[0][0]];
    monthChart();

    let i = 0;
    let count = 0;
    while (today.getFullYear() - i > 2008 && count < Math.min(5, Object.keys(data.days_per_year).length)) {
        const year = today.getFullYear() - i;
        if (!data.days_per_year[year]) {
            i++;
            continue;
        }

        const message = count === 0 ? "" : "And";
        const percentage = (data.days_per_year[year] / daysInYear(year) * 100).toFixed(3);

        document.getElementById("page-6").innerHTML += `<h${count + 2} class="${textAnimations[count + 1]}">${message} ${percentage}% of ${year}</h${count + 2}>`;

        i++;
        count++;
    }

    if (data.first_chatter.length > 1) {
        document.getElementById("first_chatter").innerHTML = data.first_chatter[0][0];
        document.getElementById("second_chatter").innerHTML = data.first_chatter[1][0];
        document.getElementById("chatter_gap").innerHTML = ((Math.abs(data.first_chatter[0][1] - data.first_chatter[1][1]) / data.first_chatter[0][1]) * 100).toFixed(3);
        pages.push(7);
    }
    
    if (data.messages_per_participant[0][1] !== (data.messages_edit_per_participant[1] || [0,0])[1]) {
        document.getElementById("most_messages").innerHTML = data.messages_per_participant[0][0];
        document.getElementById("most_messages_percentage").innerHTML = ((data.messages_per_participant[0][1] / data.total) * 100).toFixed(3);
        pages.push(8);
    }

    if (data.messages_edit_per_participant.length > 1) {
        document.getElementById("most_edits").innerHTML = data.messages_edit_per_participant[0][0];
        document.getElementById("edit_ratio").innerHTML = ((data.messages_edit_per_participant[0][1] / ((data.messages_per_participant[0][0] === data.messages_edit_per_participant[0][0])? data.messages_per_participant[0][1]: data.messages_per_participant[1][1])) * 100).toFixed(3);
        pages.push(9);
    }

    if (data.streak.streak > 0) {
        document.getElementById("streak-start").innerHTML = formatDate(data.streak.startDate);
        document.getElementById("streak-end").innerHTML = formatDate(data.streak.endDate);
        document.getElementById("streak").innerHTML = `${data.streak.streak} day${data.streak.streak === 1? "" : "s"}`;
        pages.push(10);
    }

    if (data.top_10_emojis.total > 0) {
        document.getElementById("total_emojis").innerHTML = data.top_10_emojis[0][1];
        emojiChart();
        pages.push(13);
        pages.push(14);
    }
    
    document.getElementById("participant-0").innerText += data.messages_per_participant[0][0];
    if (data.messages_per_participant.length === 1) {
        document.getElementById("participant-1").parentNode.remove();
    } else if (data.messages_per_participant.length === 2) {
        document.getElementById("participant-1").innerText += data.messages_per_participant[1][0];
    } else if (data.messages_per_participant.length > 2) {
        document.getElementById("stat-participants").innerHTML = `<h4 class="stat visible">Group chat<div class="user-deco user-deco-0"></div><div class="user-deco user-deco-1"></div><div class="user-deco user-deco-2"></div></h4>`;
    }

    const topWords = document.getElementById("top-words");
    const topEmojis = document.getElementById("top-emojis");
    for (let i = 0; i < 5; i++) {
        if (i < data.top_50_words.length) topWords.innerHTML += `<li>${data.top_50_words[i][0]}</li>`;
        if (i < data.top_10_emojis.length - 1) topEmojis.innerHTML += `<li><span class="emoji">${data.top_10_emojis[i + 1][0]}</span></li>`;
    }
    document.getElementById("total_messages").innerHTML = data.total;
    document.getElementById("streak_2").innerHTML = `${data.streak.streak} days`;

    const pageIndicators = document.getElementById("page-indicators");
    pages.sort((a, b) => a - b);
    pages.forEach(page => {
        pageIndicators.innerHTML += `<div class="page-indicator" id="page-indicator-${page}"><div class="progress"></div></div>`;
    });
}

function formatDate(dateString) {
    const dateObj = new Date(dateString);
    const date = dateObj.getDate().toString();
    return `${months[dateObj.getMonth()]} ${date}${date[date.length - 1] === "1"? "st": date[date.length - 1] === "2"? "nd": data[date.length - 1] === "3"? "rd": "th"}, ${dateObj.getFullYear()}`
}

function dayChart() {
    const maxValue = data.days[0][1];

    data.days.forEach(day => {
        document.getElementById(days[day[0]].toLowerCase()).style.height = `${Math.round((day[1] / maxValue) * 100)}%`;
    });
}

function monthChart() {
    const maxValue = data.months[0][1];

    data.months.forEach(month => {
        document.getElementById(months[month[0]].toLowerCase()).style.height = `${Math.round((month[1] / maxValue) * 100)}%`;
    })
}

/* The word cloud generating algorithm is the one made by judy-n and JLambertazzo
for their own whatsapp wrapping service. All credits go to them:
https://github.com/judy-n/WhatsAppWrapped/blob/main/static/js/wrap.js
*/
const colours = ["#f477b5", "#fcda41", "#f05120"];
const max = data.top_50_words[0][1].toString();
const min = data.top_50_words[data.top_50_words.length - 1][1].toString();
const r = (a, b, t=768) => window.innerWidth > t ? a : b;
let lastCloudWidth;
let lastWidth;

function prepareWords() {
    if (!data.top_50_words) return [];
    let words = [];
    
    data.top_50_words.forEach(word => {
        words.push({word: word[0], size: word[1].toString()});
    })
    return normalizeCloud(words);
}

function normalizeCloud(words) {
    const cloudMax = r(150,95);
    const cloudMin = r(25,10);
    return words.map(el => {
        const zeroToOne = (el.size - min) / (max - min)
        const normalized = (zeroToOne*(cloudMax - cloudMin)) + cloudMin
        return {...el, size: normalized}
    });
}

function drawCloud() {
    const cloudParent = document.getElementById("page-12");
    let words = prepareWords();
    width = cloudParent.clientWidth;
    height = cloudParent.clientHeight;
    
    if (width === lastCloudWidth) return; // don't redraw
    lastCloudWidth = width;
    
    document.getElementById("word-cloud").innerHTML = "";

    let svg = d3.select("#word-cloud").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")

    let layout = d3.layout.cloud()
    .size([width, height])
    .words(words.map(function(d) { return {text: d.word, size:d.size}; }))
    .padding(r(5,1))
    .rotate(function() { return ~~(Math.random()) * 90; })
    .fontSize(function(d) { return d.size; })
    .on("end", draw);
    layout.start();

    function draw(words) {
        svg
        .append("g")
        .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", function(d) { return d.size; })
        .style("fill", function(d) {
            return colours[Math.floor(Math.random() * colours.length)];
        })
        .attr("text-anchor", "middle")
        .style("font-family", "var(--font-family)")
        .style("font-weight", "bold")
        .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) {
            return d.text; 
        });
    }
}

window.addEventListener('resize', () => {
    drawCloud()
})

function emojiChart() {
    if (data.top_10_emojis[0][1] === 0) return;

    const chart = document.getElementById("emoji-chart");
    const maxValue = data.top_10_emojis[1][1];

    data.top_10_emojis.forEach(emoji => {
        if (emoji[0] !== "total") {
            chart.innerHTML += `<div style="width:${Math.round((emoji[1] / maxValue) * 100) + 5}%;"><span class="emoji">${emoji[0]}</span></div>`
        }
    })
}

function daysInYear(year) {
    return ((year % 4 === 0 && year % 100 > 0) || year %400 == 0) ? 366 : 365;
}

window.onclick = (event) => {
    if (pageIndex < 1) return;
    if (event.target.closest("button")) return;

    stop();
    if (event.clientX < window.innerWidth / 2) {
        previousPage(); 
    } else {
        nextPage();
    }
    start();
}

let pageIndex = 0;
let intervalId = null;
function nextPage() {
    if (pageIndex + 2 > pages.length) return;
    if (pageIndex === 0) {
        const el = document.documentElement;
        const rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen;
        rfs.call(el);
        drawCloud();
    }
    
    document.getElementById(`page-${pages[pageIndex]}`).classList.remove("active");
    document.querySelector(`#page-indicator-${pages[pageIndex]} .progress`).style.cssText = "transition:none;width:100%;"
    pageIndex++;
    document.getElementById(`page-${pages[pageIndex]}`).classList.add("active");
    document.querySelector(`#page-indicator-${pages[pageIndex]} .progress`).style.cssText = "transition:8s linear;width:100%;"
    if (!intervalId) return start();
}

function previousPage() {
    if (pageIndex === 0) return;
    
    document.getElementById(`page-${pages[pageIndex]}`).classList.remove("active");
    document.querySelector(`#page-indicator-${pages[pageIndex]} .progress`).style.cssText = "transition:none;width:0;";
    pageIndex--;
    document.getElementById(`page-${pages[pageIndex]}`).classList.add("active");
    const progressBar = document.querySelector(`#page-indicator-${pages[pageIndex]} .progress`);
    progressBar.style.cssText = "transition:none;width:0;";
    progressBar.offsetWidth;
    progressBar.style.cssText = "transition:8s linear;width:100%;"

    if (!intervalId) return start();
}

function start() {
    if (intervalId) return;

    intervalId = setInterval(nextPage, 8000);
    document.getElementById("share").classList.remove("active");
}

function stop() {
    if (!intervalId) return;
    clearInterval(intervalId);
    intervalId = null;
}

function restart() {
    document.querySelectorAll(".page-indicator .progress").forEach(progress => {
        progress.style.cssText = "transition:none;width:0;";
    });
    document.getElementById(`page-${pages[pageIndex]}`).classList.remove("active");
    document.getElementById(`page-0`).classList.add("active");
    pageIndex = 0;
    
    document.getElementById("share").classList.remove("active");
}

let isGenerating = false;

async function generateImage(id) {
    if (isGenerating) return;
    isGenerating = true;

    try {
        const fontUrls = [
            'https://fonts.googleapis.com/css2?family=Afacad+Flux:wght@100..1000&display=swap',
            'https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap'
        ];
        
        await Promise.all(fontUrls.map(async url => {
            const response = await fetch(url);
            const css = await response.text();
            const style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);
        }));
    } catch (error) {
        console.warn('Font inlining failed:', error);
        isGenerating = false;
    }

    const element = document.getElementById(id);
    const originalStyle = {
        width: element.style.width,
        height: element.style.height,
        aspectRatio: element.style.aspectRatio,
        position: element.style.position,
        transform: element.style.transform,
        borderRadius: element.style.borderRadius
    };

    const computedStyle = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    element.style.width = `${rect.width}px`;
    element.style.height = `${rect.height}px`;
    element.style.aspectRatio = 'unset';
    element.style.position = 'relative';
    element.style.transform = 'none';
    element.style.borderRadius = computedStyle.borderRadius;

    const options = {
        width: rect.width,
        height: rect.height,
        style: {
            transform: 'none',
            'transform-origin': 'center'
        }
    };

    return domtoimage.toPng(element, options)
        .then(function(dataUrl) {
            const shareText = "Check out my WhatsWrapped stats!"; // Customize this message
            const shareUrl = "https://www.whatswrapped.net"; // Your website URL

            fetch(dataUrl)
            .then(res => res.blob())
            .then(blob => {
                // Create a File from the blob
                const file = new File([blob], 'whatswrapped-stats.png', { type: 'image/png' });
                                    
                // Check if Web Share API is supported
                if (navigator.share) {
                    navigator.share({
                        title: 'My WhatsWrapped Stats',
                        text: shareText,
                        files: [file]
                    }).catch(err => {
                        console.error(err);
                        isGenerating = false;
                    });
                }
            });
        })
        .catch(function(error) {
            console.error("Error capturing element:", error);
            isGenerating = false;
        })
        .finally(() => {
            Object.assign(element.style, originalStyle);
            isGenerating = false;
        });
}

const detectSwipeUp = (element) => {
    let touchstartY = 0;
    
    element.addEventListener('touchstart', e => touchstartY = e.touches[0].clientY);
    
    element.addEventListener('touchend', e => {
      const touchendY = e.changedTouches[0].clientY;
      const diff = touchstartY - touchendY;
      if (diff > 50) toggleShare(`page-${pageIndex}`);
    });
};

document.addEventListener("keydown", (event)=> {
    if (event.key === "ArrowUp") toggleShare(`page-${pageIndex}`);
});

function toggleShare() {
    if (pageIndex > pages.length - 2 || pageIndex === 0) return;
    stop();
    document.getElementById("share").classList.toggle("active");
    if (!document.getElementById("share").classList.contains("active")) return nextPage();
}

function selectColour(colorCode) {
    document.querySelectorAll(".share-card").forEach(card => {
        card.style.background = colorCode;
    })
}