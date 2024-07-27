var folderPath;

let queries = {};
let url = new URL(window.location.href);
for(let pair of url.searchParams){
    queries[pair[0]] = pair[1];
}
if(queries.map && queries.agent){
    gtag('event', 'page_type', {
        'map': queries.map,
        'agent': queries.agent
      });

    folderPath = "note/" + queries.map + "/";
    (async() => {
        let r = await fetch(window.location.origin + "/valorant/note/" + queries.map + "/" + queries.agent + ".json");
        if(r.ok){
            let data = await r.json();
            loadPage(queries.agent, data);
        }
    })();
}

function loadPage(agent, data){
    var eImgViewContainer = document.createElement("div");
    var eImgView = document.createElement("img");
    var eImgViewCloseBtn = document.createElement("div");
    
    eImgView.setAttribute("draggable", "false");
    eImgViewContainer.classList.add("image-view-container");
    eImgViewCloseBtn.classList.add("image-view-close-btn");
    if(!('ontouchstart' in document.documentElement)){
        eImgViewContainer.innerHTML = `
        <div class="image-view-feature">
            <span>Zoom (Ctrl + Left/Right Click)</span>
            <span>Zoom In/Out (Ctrl + Wheel)</span>
            <span>Move (Drag)</span>
            <span>Close (Esc)</span>
        </div>`
    }
    
    eImgViewContainer.appendChild(eImgView);
    eImgViewContainer.appendChild(eImgViewCloseBtn);
    
    eDetail = document.createElement("div");
    eDetailContent = document.createElement("div");
    eDetailCloseBtn = document.createElement("div");
    eDetailTitle = document.createElement("div");
    
    eDetail.classList.add("detail");
    eDetailContent.classList.add("detail-content");
    eDetailCloseBtn.classList.add("detail-close-btn");
    eDetailTitle.classList.add("detail-title");
    
    eDetail.appendChild(eDetailCloseBtn);
    eDetail.appendChild(eDetailContent);
    eDetail.appendChild(eDetailTitle);
    
    let eIndex = document.createElement("ul");
    eIndex.setAttribute("id", "index");
    let eHiddenContent = document.createElement("div");
    eHiddenContent.setAttribute("id", "hidden-content");
    eHiddenContent.style.display = "none";
    
    document.body.appendChild(eIndex);
    document.body.appendChild(eHiddenContent);
    document.body.appendChild(eDetail);
    document.body.appendChild(eImgViewContainer);
    
    var imgViewScale = 1;
    var imgViewScaleStep = .3;
    var imgViewOffsetX = 0;
    var imgViewOffsetY = 0;
    
    eImgViewCloseBtn.addEventListener("click", e => {
        eImgViewContainer.style.display = "none";
    });
    
    document.addEventListener("keydown", e => {
        if(e.key === "Escape"){
            if(eImgViewContainer.style.display !== "none"){
                eImgViewContainer.style.display = "none";
                imgViewScale = 0;
                imgViewOffsetX = 0;
                imgViewOffsetY = 0;
            }else if(eDetail.style.display !== "none"){
                eDetail.style.display = "none";
            }
        }
    });
    
    eImgViewContainer.addEventListener("contextmenu", e => {
        e.preventDefault();
    });
    
    eImgViewContainer.addEventListener("mousedown", e => {
        if(e.ctrlKey){
            let v = 0;
            if(e.buttons === 1){
                v = -400;
            }else if(e.buttons === 2){
                v = 400;
            }
            zoomImageView(e.clientX, e.clientY, v, 1.5);
        }
    });
    
    eImgViewContainer.addEventListener("wheel", e => {
        if(e.ctrlKey){
            e.preventDefault();
            zoomImageView(e.clientX, e.clientY, e.deltaY)
        }
    }, {passive: false});
    
    function zoomImageView(x, y, amount, movementStep = 10){
        imgViewScale = Math.min(10, Math.max(1, imgViewScale + amount / (-100 / imgViewScaleStep)));
        eImgViewContainer.style.transform = `scale(${imgViewScale})`;

        imgViewOffsetX -= imgViewOffsetX / Math.pow(imgViewScale, 3) + ((x - window.innerWidth / 2) / (movementStep * imgViewScale));
        imgViewOffsetY -= imgViewOffsetY / Math.pow(imgViewScale, 3) + ((y - window.innerHeight / 2) / (movementStep * imgViewScale));
    
        if(imgViewScale === 1) {
            imgViewOffsetX = 0;
            imgViewOffsetY = 0;
        }
    
        eImgView.style.transform = `translate(${imgViewOffsetX}px, ${imgViewOffsetY}px)`;
    }
    
    eImgViewContainer.addEventListener("mousemove", e => {
        if(e.buttons === 1){
            imgViewOffsetX += e.movementX / imgViewScale;
            imgViewOffsetY += e.movementY / imgViewScale;
            eImgView.style.transform = `translate(${imgViewOffsetX}px, ${imgViewOffsetY}px)`;
        }
    });
    
    eDetailCloseBtn.addEventListener("click", e => {
        eDetail.style.display = "none";
        document.body.style.overflowY = "auto";
    });
    
    eDetail.addEventListener("click", e => {
        if(e.target instanceof HTMLImageElement){
            eImgView.src = e.target.src;
            eImgViewContainer.style.display = "flex";
        }
    });
    
    document.addEventListener("click", e => {
        let item = null;
        if(e.target.classList.contains("flex-item")){
            item = e.target;
        }else{
            let temp = e.target.parentElement;
            while(temp && !temp.classList.contains("flex-item")){
                temp = temp.parentElement;
                if(temp === null){
                    break;
                }
            }
            item = temp;
        }
    
        if(item){
            let id = item.getAttribute("id");
            showPage(id);
        }
    });
    
    function showPage(id){
        let content = eHiddenContent.querySelector("#" + id);
            
        if(agent === "sova"){
            eDetailTitle.textContent = `${content.getAttribute("bounce")}バウンス ${content.getAttribute("charge")}チャージ`
        }
    
        eDetailContent.innerHTML = content.innerHTML;
        eDetail.style.top = "20px";
        eDetail.style.display = "flex";
        document.body.style.overflowY = "hidden";
    }
    
    var detailScrollAmount = 0;
    var lastTouchPos;
    
    document.addEventListener("wheel", onScroll);
    document.addEventListener("touchmove", onScroll);
    document.addEventListener("touchend", () => {lastTouchPos = null;});
    
    function onScroll(e){
        if(eDetail.style.display === "flex"){
            if(e instanceof TouchEvent){
                if(lastTouchPos){
                    let deltaY = lastTouchPos.y - e.touches[0].pageY;
                    e.deltaY = deltaY;
                }
                lastTouchPos = {x: e.touches[0].pageX, y: e.touches[0].pageY};
            }
            if(e.deltaY){
                detailScrollAmount = Math.min(20, Math.max(window.screen.height - eDetail.clientHeight - 200, detailScrollAmount - e.deltaY));
                eDetail.style.top = detailScrollAmount + "px";
            }
        }
    }
    
    let eNav = document.createElement("nav");
    eNav.innerHTML = `
                <div class="nav-bar">
                    <div class="nav-item-pages">
                        <span>ページ一覧</span>
                        <div class="nav-pages">
                        </div>
                    </div>
                    <input type="text" class="nav-item-filter" placeholder="タイトルで探す">
                </div>`
    let eNavPages = eNav.querySelector(".nav-pages");
    let eNavItemPages = eNav.querySelector(".nav-item-pages");
    eNavItemPages.addEventListener("click", e => {
        if(eNavPages.style.display === "none"){
            eNavPages.style.display = "inline-block";
        }else {
            eNavPages.style.display = "none";
        }
    });
    eNavItemPages.addEventListener("mouseleave", e => {
        eNavPages.style.display = "none";
    });
    eNavPages.addEventListener("click", e => {
        let id = e.target.getAttribute("id");
        if(id) {
            eNavPages.style.display = "none";
            showPage(id);
        }
    });
    eNav.querySelector("input").addEventListener("input", evt => {
        document.querySelectorAll(".flex-item").forEach(e => {
            e.style.display = "flex";
            if(!e.querySelector("#m").textContent.toLowerCase().includes(evt.target.value.toLowerCase())) {
                e.style.display = "none";
            }
        });
    });
    
    var skillImages = {
        //sova
        "recon": "https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/abilities/ability2/displayicon.png",
        "shock": "https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/abilities/ability1/displayicon.png",
        //viper
        "snakebite": "https://media.valorant-api.com/agents/707eab51-4836-f488-046a-cda6bf494859/abilities/grenade/displayicon.png",
        "poisoncloud": "https://media.valorant-api.com/agents/707eab51-4836-f488-046a-cda6bf494859/abilities/ability1/displayicon.png"
    }
    
    let i = 0;
    for(let d of data){
        let eNavPageCategory = document.createElement("div");
        eNavPageCategory.classList.add("nav-pages-row", "nav-pages-category");
        eNavPageCategory.innerHTML = `<span>${d.category}</span>`;
        eNavPages.appendChild(eNavPageCategory);
    
        let eListItem = document.createElement("li");
        let eFlex = document.createElement("div");
        eFlex.classList.add("flex");
        for(let record of d.records){
            i++;
    
            let eNavPageItem = document.createElement("div");
            eNavPageItem.classList.add("nav-pages-row", "nav-pages-item");
            eNavPageItem.innerHTML = `<span id=i${i}>${record.attr.to}</span>`;
            eNavPages.appendChild(eNavPageItem);
    
            let eItem = document.createElement("div");
            eItem.setAttribute("id", "i" + i);
            if(record.attr){
                for(let key of Object.keys(record.attr)){
                    eItem.setAttribute(key, record.attr[key]);       
                }
            }
            for(let item of record.items) {
                let eDI = document.createElement("div");
                eDI.classList.add("detail-item");
                let eImg = document.createElement("img");
                let eUnOrderedList = document.createElement("ul");
                eImg.setAttribute("loading", "lazy");
                eImg.src = folderPath + item.image;
                eDI.appendChild(eImg);
                eDI.appendChild(eUnOrderedList);
    
                for(let text of item.texts){
                    let eText = document.createElement("li");
                    eText.textContent = text;
                    eUnOrderedList.appendChild(eText);
                }
    
                eItem.appendChild(eDI);
            }
            eHiddenContent.appendChild(eItem);
    
            let eFlexItem = document.createElement("div");
            eFlexItem.classList.add("flex-item");
            eFlexItem.setAttribute("id", "i" + i);
    
            if(record.result){
                eFlexItem.innerHTML = `<img src="${folderPath + record.result}">`;
            }else {
                eFlexItem.innerHTML = `<p>${record.altText}</p>`;
            }
            let eContentGrid = document.createElement("div");
            eContentGrid.classList.add("flex-item-content-grid");
            eContentGrid.innerHTML = `
            <div class="flex-item-content-grid-box" id="l"></div>
            <div class="flex-item-content-grid-box" id="m"></div>
            `
            if(record.attr.skill){
                let eSkillImg = document.createElement("img");
                if(record.attr.skill in skillImages) eSkillImg.src = skillImages[record.attr.skill];
                eContentGrid.querySelector("#l").appendChild(eSkillImg);
            }
            if(record.attr.to){
                let eTo = document.createElement("span");
                eTo.textContent = record.attr.to;
                eContentGrid.querySelector("#m").appendChild(eTo);
            }
            eFlexItem.appendChild(eContentGrid);
    
            eFlex.appendChild(eFlexItem);
        }
        eListItem.innerHTML = `<p id="category-title">${d.category}</p>`
        eListItem.appendChild(eFlex);
        eIndex.appendChild(eListItem);
    }
    
    document.body.prepend(eNav);
}