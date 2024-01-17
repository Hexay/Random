let settings;
async function createElements() {
    if (settings == undefined) await loadSettings();
    if (settings.BMToken === undefined || settings.BMToken === "" || settings.SteamToken === undefined || settings.SteamToken === "") return;

    const playerPage = document.getElementById("RCONPlayerPage");

    const row = document.querySelector("#RCONPlayerPage > div.row");
    const col = playerPage.childNodes[1].childNodes[0];

    const BMID = getCurrentBMUserID();
    let playerData;
    let steamID;

    let steamInformationTabExists = false;
    for (const childNode of col.childNodes) {
        if (childNode.childNodes[0].childNodes[0]?.innerText.includes("Steam Information")) {
            steamInformationTabExists = true;
        }
    }

    if (steamInformationTabExists) {
        playerData = col.childNodes[1].childNodes[1].childNodes[0];
        steamID = playerData.children[1].children[0].getAttribute("href").match("[0-9]+$")[0];
    } else {
        // fix for bm not querying steam details (Steam Information tab missing)
        for (const x of col.childNodes[0].childNodes[1].childNodes[0].childNodes[1].childNodes[1].childNodes) {
            if (x.childNodes[1].childNodes[0].innerText === "Steam ID") {
                steamID = x.childNodes[0].childNodes[0].childNodes[0].innerText;
            }
        }

        const div = createElement("div", "", col);
        const h2 = createElement("h2", "", div);
        h2.classList.add("css-1xs030v");
        const s = createElement("span", "", h2);
        const i = createElement("i", "", s);
        i.classList.add("glyphicon");
        i.classList.add("glyphicon-chevron-right");
        i.classList.add("css-a52oks");
        s.innerHTML += "Steam Information";
        const collapse = createElement("div", "", div);
        collapse.classList.add("collapse");
        collapse.classList.add("in");
        playerData = createElement("dl", "", collapse);
        playerData.classList.add("dl-horizontal");

        row.childNodes[0].childNodes[0].after(div);
    }

    if (steamID === undefined) return;

    // head
    const headContainer = createElement("div", "", playerPage);
    headContainer.after(row);
    const name = playerPage.childNodes[0];
    const imageContainer = createElement("div", "", headContainer);
    headContainer.classList.add("advanced-bm-head");
    PROFILEPICTURE = createElement("img", "", imageContainer);
    imageContainer.appendChild(name);
    ONLINESERVER = createElement("h4", "Current Server:", headContainer);
    SERVERIP = createElement("h4", "IP: Loading...", headContainer);
    JOINED = createElement("h4", "Joined:", headContainer);

    // steam profile visibility, limited, account created (steam + bm)
    const profileContainer = createElement("div", "", playerData);
    createElement("br", "", profileContainer);
    createElement("dt", "Steam Profile Visibility:", profileContainer);
    STEAMPROFILEVISIBILITY = createElement("dd", "Loading...", profileContainer);
    createElement("dt", "Steam Account created:", profileContainer);
    STEAMPROFILECREATED = createElement("dd", "Loading...", profileContainer);
    createElement("dt", "BM Account Created:", profileContainer);
    BMACCOUNTCREATED = createElement("dd", "Loading...", profileContainer);

    // rustadmin, serverarmour, ruststats.gg
    if (settings.RustAdmin === true) {
        createElement("dt", "RustAdmin Bans:", profileContainer);
        const rustAdmin = createElement("dd", "", profileContainer);
        const rustAdminLink = createElement("a", "Click to open", rustAdmin);
        rustAdminLink.href = `https://www.rustadmin.com/playerBans-${steamID}`;
        rustAdminLink.setAttribute("target", "_blank");
    }
    if (settings.ServerArmour === true) {
        createElement("dt", "ServerArmour Profile:", profileContainer);
        const serverArmour = createElement("dd", "", profileContainer);
        const serverArmourLink = createElement("a", "Click to open", serverArmour);
        serverArmourLink.href = `https://io.serverarmour.com/profile/${steamID}`;
        serverArmourLink.setAttribute("target", "_blank");
    }
    if (settings.RustStats === true) {
        createElement("dt", "RustStats.gg Profile:", profileContainer);
        const rustStats = createElement("dd", "", profileContainer);
        const rustStatsLink = createElement("a", "Click to open", rustStats);
        rustStatsLink.href = `https://ruststats.gg/rust-stats/user/${steamID}`;
        rustStatsLink.setAttribute("target", "_blank");
    }

    // eac banned ips
    createElement("br", "", profileContainer);
    createElement("dt", "EAC Banned IPs:", profileContainer);
    EACBANNEDIPS = createElement("dd", "", profileContainer);
    const EACBANNEDIPSBUTTON = createElement("a", "Click to check", EACBANNEDIPS);
    EACBANNEDIPSBUTTON.onclick = () => {
        chrome.runtime.sendMessage({ type: "GetEACBannedAlts", BMID: BMID });
        EACBANNEDIPS.innerText = "Loading...";
    };

    // bm banned ips
    createElement("dt", "BM Banned IPs:", profileContainer);
    BMBANNEDIPS = createElement("dd", "", profileContainer);
    const BMBANNEDIPSBUTTON = createElement("a", "Click to check", BMBANNEDIPS);
    BMBANNEDIPSBUTTON.onclick = () => {
        chrome.runtime.sendMessage({ type: "GetBMBannedAlts", BMID: BMID });
        BMBANNEDIPS.innerText = "Loading...";
    };

    //online friends
    createElement("dt", "Online Friends:", profileContainer);
    ONLINEFRIENDS = createElement("dd", "Loading...", profileContainer);

    //Atlas and vital 
    let atlasGuildID = "870207685541363732"
    let atlasChannelID = "923832290222686249"
    let vitalGuildID = "767209374355030026"
    let vitalChannelID = "882174782823608320"
    createElement("dt", "Atlas Bans:", profileContainer);
    ATLASBANSINFO = createElement("dd", "", profileContainer);
    getAtlasBans(atlasGuildID, atlasChannelID, steamID, settings.Discord).then(info => {
        handleAtlas(info)
    })

    createElement("dt", "Vital Bans:", profileContainer);
    VITALBANSINFO = createElement("dd", "", profileContainer);
    getVitalBans(vitalGuildID, vitalChannelID, steamID, settings.Discord).then(info => {
        handleVital(info)
    })

    // kills, deaths, kd
    createElement("br", "", profileContainer);
    createElement("dt", "Kills:", profileContainer);
    KILLS = createElement("dd", "Loading...", profileContainer);
    createElement("dt", "Deaths:", profileContainer);
    DEATHS = createElement("dd", "Loading...", profileContainer);
    createElement("dt", "K/D:", profileContainer);
    KD = createElement("dd", "Loading...", profileContainer);

    // reports
    createElement("br", "", profileContainer);
    createElement("dt", "Cheating Reports:", profileContainer);
    CHEATINGREPORTS = createElement("dd", "Loading...", profileContainer);
    createElement("dt", "Teaming Reports:", profileContainer);
    TEAMINGREPORTS = createElement("dd", "Loading...", profileContainer);
    createElement("dt", "Other Reports:", profileContainer);
    OTHERREPORTS = createElement("dd", "Loading...", profileContainer);

    // arkan
    if (settings.Arkan === true) {
        createElement("br", "", profileContainer);
        createElement("dt", "Arkan Aimbot:", profileContainer);
        ARKANAIMBOT = createElement("dd", "Loading...", profileContainer);
        createElement("dt", "Arkan Norecoil:", profileContainer);
        ARKANNORECOIL = createElement("dd", "Loading...", profileContainer);
    }

    // guardian
    if (settings.Guardian === true) {
        createElement("br", "", profileContainer);
        createElement("dt", "Guardian Anti-Cheat:", profileContainer);
        GUARDIANANTICHEAT = createElement("dd", "Loading...", profileContainer);
        createElement("dt", "Guardian Anti-Flood:", profileContainer);
        GUARDIANANTIFLOOD = createElement("dd", "Loading...", profileContainer);
    }

    // servers played, bm playtime, aim train playtime, your servers playtime
    createElement("br", "", profileContainer);
    createElement("dt", "Steam Playtime:", profileContainer);
    STEAMPLAYTIME = createElement("dd", "Loading...", profileContainer);
    createElement("dt", "Rust BM playtime:", profileContainer);
    BMPLAYTIME = createElement("dd", "Loading...", profileContainer);
    createElement("dt", "Aim train playtime:", profileContainer);
    AIMTRAINPLAYTIME = createElement("dd", "Loading...", profileContainer);

    if (settings.Servers !== undefined && settings.Servers.some((x) => x.enabled)) {
        createElement("dt", "Your servers Playtime:", profileContainer);
        YOURSERVERSPLAYTIME = createElement("dd", "Loading...", profileContainer);
    }
    createElement("dt", "Rust servers played:", profileContainer);
    SERVERSPLAYED = createElement("dd", "Loading...", profileContainer);

    // collapsable div
    const div = createElement("div", "", row.childNodes[0]);
    row.childNodes[0].childNodes[1].after(div);
    const h2 = createElement("h2", "", div);
    h2.classList.add("css-1xs030v");
    const span = createElement("span", "", h2);
    const i = createElement("i", "", span);
    i.classList.add("glyphicon");
    i.classList.add("glyphicon-chevron-right");
    i.classList.add("css-a52oks");
    span.innerHTML += "Advanced BM RCON";
    const collapse = createElement("div", "", div);
    collapse.style.display = "block";

    EACBANNEDIPSINFO = createElement("div", "", collapse);
    BMBANNEDIPSINFO = createElement("div", "", collapse);
    ONLINEFRIENDSINFO = createElement("div", "", collapse);

    chrome.runtime.sendMessage({ type: "GetPlayerInfo", BMID: BMID, SteamID: steamID });
    chrome.runtime.sendMessage({ type: "GetPlayerSummaries", SteamID: steamID });
    chrome.runtime.sendMessage({ type: "GetSteamPlaytime", SteamID: steamID });
    chrome.runtime.sendMessage({ type: "GetActivity", BMID: BMID });
}

function createElement(tag, content, parent, id) {
    let newElement = document.createElement(tag);
    newElement.className = "advanced-bm-rcon";
    newElement.appendChild(document.createTextNode(content));
    if (id !== undefined) newElement.id = id;
    parent.appendChild(newElement);
    return parent.lastChild;
}

function getCurrentBMUserID() {
    currentUrl = window.location.href;
    return currentUrl.match("players/[0-9]+/*")[0].replace("players/", "");
}

async function loadSettings() {
    settings = await chrome.storage.local.get(["BMToken", "SteamToken", "Arkan", "Guardian", "RustAdmin", "ServerArmour", "RustStats", "Servers", "Discord"]);
}

function daysBetweenDates(date1, date2) {
    const startDate = new Date(date1);
    const endDate = date2 ? new Date(date2) : new Date();
    const timeDifference = Math.abs(endDate - startDate);
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    return daysDifference;
}

function getTextBefore(input, char) {
    let result = input.split(char)[0].trim();
    result = cleanInput(result)
    return result;
}

function cleanInput(input) {
    return input.replace(/\*/g, '').replace(/`/g, '')

}

async function getAtlasBans(guildID, channelID, steamID, authorization) {
    const response = await fetch("https://discord.com/api/v9/guilds/"+guildID+"/messages/search?channel_id="+channelID+"&content="+steamID, {
        headers: {
            authorization: authorization,
        },
        method: "GET",
    });
    if (response.status === 401) {
        return [["Discord Token Invalid", "https://google.com"]]
    }
    data = await response.json()
    console.log(data)
    let atlasBans = [];
    for (let i = 0; i < data["total_results"]; i++) {   
        field = data["messages"][i][0]["embeds"][0]["fields"]
        expiry = getTextBefore(field[1]["value"], "-")
        reason = getTextBefore(field[2]["value"], "-")
        if (reason.includes("Main")) {
            continue
        }
        age = daysBetweenDates(data["messages"][i][0]["timestamp"])
        info = `Expiry:${expiry} Reason:${reason} (${age} days ago)`
        atlasBans.push([info, `https://discord.com/channels/${guildID}/${channelID}/${data["messages"][i][0]["id"]}`])
        console.log(info)
        
    }
    return atlasBans

}

async function getVitalBans(guildID, channelID, steamID, authorization) {
    const response = await fetch("https://discord.com/api/v9/guilds/"+guildID+"/messages/search?channel_id="+channelID+"&content="+steamID, {
        headers: {
            authorization: authorization,
        },
        method: "GET",
    });
    if (response.status === 401) {
        return [["Discord Token Invalid", "https://google.com"]]
    }
    data = await response.json()
    console.log(data)
    let vitalBans = [];
    for (let i = 0; i < data["total_results"]; i++) {   
        field = data["messages"][i][0]["embeds"][0]["fields"]
        expiry = getTextBefore(field[3]["value"], "-")
        reason = getTextBefore(field[1]["value"], ":")
        if (reason.includes("Main")) {
            continue
        }
        age = daysBetweenDates(data["messages"][i][0]["timestamp"])
        info = `Expiry:${expiry} Reason:${reason} (${age} days ago)`
        vitalBans.push([info, `https://discord.com/channels/${guildID}/${channelID}/${data["messages"][i][0]["id"]}`])
        console.log(info)
    }
    return vitalBans
}

function createElement(tag, content, parent, id) {
    let newElement = document.createElement(tag);
    newElement.className = "advanced-bm-rcon";
    newElement.appendChild(document.createTextNode(content));
    if (id !== undefined) newElement.id = id;
    parent.appendChild(newElement);
    return parent.lastChild;
}

function handleAtlas(info) {
    console.log("HEREE",info.length,info)
    if (info.length > 0) {
        console.log("HERE")
        setStaticColor(ATLASBANSINFO, "Red");
        let div = createElement("ul", "", ATLASBANSINFO)
        for (let i = 0; i < info.length; i++) { 
            let li = createElement("li", "", div);
            let a = createElement("a", info[i][0], li);
            a.href = info[i][1];
            a.target = "_blank";
        }
    }
    else {
        setStaticColor(ATLASBANSINFO, "LimeGreen");
        let div = createElement("ul", "", ATLASBANSINFO)
        let li = createElement("li", "", div);
        let span = createElement("span", "None", li);
    }
}

function handleVital(info) {
    console.log("HEREE",info.length,info)
    if (info.length > 0) {
        console.log("HERE")
        setStaticColor(VITALBANSINFO, "Red");
        let div = createElement("ul", "", VITALBANSINFO)
        for (let i = 0; i < info.length; i++) { 
            let li = createElement("li", "", div);
            let a = createElement("a", info[i][0], li);
            a.href = info[i][1];
            a.target = "_blank";
        }
    }
    else {
        setStaticColor(VITALBANSINFO, "LimeGreen");
        let div = createElement("ul", "", VITALBANSINFO)
        let li = createElement("li", "", div);
        let span = createElement("span", "None", li);
    }
}


chrome.storage.onChanged.addListener((changes, namespace) => {
    settings = undefined;
});
