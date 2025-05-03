/*  Play Button Animation */
function addPlayBtnAnimation() {
	let songCards = document.querySelectorAll(".song-card")
	songCards.forEach((card) => {
		let initialHTML = card.innerHTML
		card.addEventListener("mouseenter", () => {
			card.insertAdjacentHTML(
				"afterbegin",
				`
        <div class="play-btn">
        <span class="circle">
        <img src="./assets/images/playBtn.svg" alt="play">
        </span>
        </div>
        `
			)
		})
		card.addEventListener("mouseleave", () => {
			card.innerHTML = initialHTML
		})
	})
}

/* Helper to extract links from Vercel directory listing HTML */
function extractLinksFromDirectoryListing(html) {
	let links = [];
	let parser = new DOMParser();
	let doc = parser.parseFromString(html, "text/html");
	let fileLinks = doc.querySelectorAll("#files a");
	fileLinks.forEach(a => {
		links.push({
			href: a.getAttribute("href"),
			text: a.textContent,
			class: a.className
		});
	});
	return links;
}

/* Populating library with available Songs */
async function getSongs(AlbumFolder) {
	let response = await fetch(`./songs/${AlbumFolder}`);
	let data = await response.text();
	let links = extractLinksFromDirectoryListing(data);

	let songsArray = [];
	links.forEach(link => {
		if (link.href.endsWith(".mp3")) {
			let url = link.href;
			// Only prepend if not absolute (doesn't start with "/" or "http")
			if (!/^([\/]|https?:)/.test(url)) {
				url = `./songs/${AlbumFolder}/${url}`;
			}
			songsArray.push(url);
		}
	});
	return songsArray;
}

async function populateLibrary(currSong, AlbumFolder) {
	let songsArray = await getSongs(AlbumFolder)
	let songsArea = document.querySelector(".songs-area");
	songsArea.innerHTML = "";

	let response = await fetch("./songs/" + AlbumFolder + "/info.json");
	let metadata = await response.json();

	let playFirstSong = false;

	songsArray.forEach((songURL) => {
		let songName = decodeURIComponent(songURL.substring(songURL.lastIndexOf("/") + 1, songURL.lastIndexOf(".")));
		let song = document.createElement("div")
		song.setAttribute("class", "song black-card")
		song.insertAdjacentHTML(
			"afterbegin",
			`
                        <div class="first">
                            <img src="./assets/images/music-icon.svg" alt="play">
                            <div class="song-info">
                                <p id="trackName">${songName}</p>
                                <p id="artistName">${metadata.artist}</p>
                            </div>
                        </div>
                        <img src="./assets/images/playBtn.svg" alt="play">
    `
		)
		song.addEventListener("click", () => {
			let trackName = `${song.querySelector("#trackName").innerText}`;
			playSong(currSong, songURL, trackName);
			document
				.querySelector(".playbar ul>li:nth-child(2)")
				.children[0].setAttribute("src", "./assets/images/pausebtnplaybar.svg")
			console.log(`Playing : ${songURL}`)
		})
		songsArea.insertAdjacentElement("beforeend", song);

		if (!playFirstSong) {
			playFirstSong = true;
			playSong(currSong, songURL, songName);
			document
				.querySelector(".playbar ul>li:nth-child(2)")
				.children[0].setAttribute(
					"src",
					"./assets/images/pausebtnplaybar.svg"
				)
		}
	})

	return songsArray;
}

function secondsToString(seconds) {
	if (isNaN(seconds) || seconds < 0) {
		return "00:00"
	}
	seconds = Math.round(seconds)
	let minutes = Math.floor(seconds / 60)
	let remainder = seconds % 60
	if (remainder < 10) {
		remainder = "0" + remainder
	}
	if (minutes < 10) {
		minutes = "0" + minutes
	}
	return minutes + ":" + remainder
}

function playSong(currSong, songURL, trackName) {
	currSong.pause();
	currSong.src = songURL
	currSong.setAttribute(`data-trackName`, trackName)
	currSong.load();
	currSong.play();
}

async function addsongCards() {
	let response = await fetch("./songs");
	let text = await response.text();
	let links = extractLinksFromDirectoryListing(text);
	// console.log("Extracted links from ./songs:", links);

	for (let link of links) {
		// console.log("Checking link:", link);

		let parts = link.href.split("/");
		// console.log("Parts of link:", parts);
		let AlbumFolder = decodeURIComponent(parts[parts.length - 1] || parts[parts.length - 2]);
		// console.log("AlbumFolder candidate:", AlbumFolder);
		if (AlbumFolder === "" || AlbumFolder === "." || AlbumFolder === "..") continue;

		let metaUrl = `./songs/${AlbumFolder}/info.json`;
		try {
			let response = await fetch(metaUrl);
			let metadata = await response.json();
			// console.log("Loaded metadata for", AlbumFolder, metadata);

			let songCard = document.createElement("div");
			songCard.setAttribute("class", "song-card");
			songCard.setAttribute("data-albumFolder", AlbumFolder);
			songCard.innerHTML = `
				<div class="overlay"></div>
				<!-- play button added via JS upon hover over song card -->
				<img src=${"./songs/" + AlbumFolder + "/cover.jpg"} alt="song">
				<div class="song-title">${metadata.title}</div>
				<div class="song-text">${metadata.description}</div>
			`;

			let spotifyPlaylistsSection = document.querySelector(".spotify-playlists");
			spotifyPlaylistsSection.insertAdjacentElement("beforeend", songCard);
		} catch (e) {
			console.warn("Failed to load metadata for", AlbumFolder, e);
			continue;
		}
	}
}

async function main() {
	await addsongCards();
	addPlayBtnAnimation();

	let currSong = new Audio()
	currSong.setAttribute(`data-trackName`, ``)

	let AlbumFolder = "parmish_verma";
	let songsArray = await populateLibrary(currSong, AlbumFolder);
	// console.log("songsArray: ", songsArray);

	let pauseplaybtn = document.querySelector(".playbar ul>li:nth-child(2)")
	pauseplaybtn.addEventListener("click", () => {
		if (currSong.currentSrc == "") {
			//Do nothing
		} else if (currSong.paused) {
			currSong.play()
			pauseplaybtn.children[0].setAttribute(
				"src",
				"./assets/images/pausebtnplaybar.svg"
			)
		} else {
			currSong.pause()
			pauseplaybtn.children[0].setAttribute(
				"src",
				"./assets/images/playbtnplaybar.svg"
			)
		}
	})

	let prevbtn = document.getElementById("prevBtn");
	prevbtn.addEventListener("click", () => {
		if (currSong.currentSrc == "" || !songsArray.length) {
			return;
		}
		let currentUrl = currSong.currentSrc;
		// Find the index by matching the filename (since Vercel links are absolute)
		let currentFile = decodeURIComponent(currentUrl.split("/").pop());
		let idx = songsArray.findIndex(url => decodeURIComponent(url.split("/").pop()) === currentFile);
		if (idx === -1) return;
		let prevSongIndex = (idx === 0) ? 0 : idx - 1;
		let newUrl = songsArray[prevSongIndex];
		let newTrackName = decodeURIComponent(newUrl.split("/").pop().replace(".mp3", ""));
		playSong(currSong, newUrl, newTrackName);
	});

	let nxtbtn = document.getElementById("nxtBtn");
	nxtbtn.addEventListener("click", () => {
		if (currSong.currentSrc == "" || !songsArray.length) {
			return;
		}
		let currentUrl = currSong.currentSrc;
		let currentFile = decodeURIComponent(currentUrl.split("/").pop());
		let idx = songsArray.findIndex(url => decodeURIComponent(url.split("/").pop()) === currentFile);
		if (idx === -1) return;
		let nextSongIndex = (idx === (songsArray.length - 1)) ? idx : idx + 1;
		let newUrl = songsArray[nextSongIndex];
		let newTrackName = decodeURIComponent(newUrl.split("/").pop().replace(".mp3", ""));
		playSong(currSong, newUrl, newTrackName);
	});

	let songName = document.getElementsByClassName("song-name")[0]
	currSong.addEventListener("playing", () => {
		songName.innerHTML = `${currSong.getAttribute(`data-trackName`)}`
	})

	let songDuration = document.getElementsByClassName("song-duration")[0]
	let seekBtn = document.querySelector(".seekbar > .circle")
	currSong.addEventListener("timeupdate", () => {
		songDuration.innerText = `${secondsToString(
			currSong.currentTime
		)} / ${secondsToString(currSong.duration)}`
		seekBtn.style.left = `${(currSong.currentTime / currSong.duration) * 100}%`
	})

	let volumeImg = document.getElementsByClassName("volume")[0].children[0];
	let volumeSeekBar = document.getElementById("volume");
	volumeSeekBar.addEventListener("change", (e) => {
		currSong.volume = (e.target.value) / 100;
		volumeImg.setAttribute("src", "./assets/images/volumebtn.svg")
	})

	volumeImg.addEventListener("click", () => {
		if (volumeImg.src.endsWith("volumebtn.svg")) {
			volumeImg.setAttribute("src", "./assets/images/volumebtnmuted.svg");
			volumeSeekBar.value = 0;
		} else {
			volumeImg.setAttribute("src", "./assets/images/volumebtn.svg")
			volumeSeekBar.value = 50;
		}
		currSong.volume = volumeSeekBar.value / 100;
	})

	let seekbarWrapper = document.querySelector(".seekbar-wrapper")
	seekbarWrapper.addEventListener("click", (e) => {
		let percentageSeeked =
			(e.offsetX / e.target.getBoundingClientRect().width) * 100
		seekBtn.style.left = `${percentageSeeked}%`
		currSong.currentTime = (currSong.duration * percentageSeeked) / 100
	})

	let menuicon = document.getElementById("openmenu-icon")
	menuicon.addEventListener("click", () => {
		document.getElementsByClassName("sidebar")[0].style.left = `0px`
	})

	let closemenuicon = document.getElementById("closemenu-icon")
	closemenuicon.addEventListener("click", () => {
		document.getElementsByClassName("sidebar")[0].style.left = `-290px`
	})

	let allSongCards = Array.from(document.getElementsByClassName("song-card"));
	allSongCards.forEach((songCard) => {
		songCard.addEventListener("click", (event) => {
			let AlbumFolder = event.currentTarget.dataset.albumfolder;
			let promise = populateLibrary(currSong, AlbumFolder);
			promise.then((value) => {
				songsArray = value;
			});
		});
	});
}

main();