let controlBtns = document.querySelectorAll(".controlBtn");
let gridItems = document.querySelectorAll(".grid-item");
const item0 = document.getElementById("item0");
const item1 = document.getElementById("item1");
const item2 = document.getElementById("item2");
const item3 = document.getElementById("item3");
const item4 = document.getElementById("item4");
const item5 = document.getElementById("item5");
const item6 = document.getElementById("item6");
const item7 = document.getElementById("item7");
const item8 = document.getElementById("item8");
const item9 = document.getElementById("item9");
const item10 = document.getElementById("item10");
const item11 = document.getElementById("item11");
const item12 = document.getElementById("item12");
const item13 = document.getElementById("item13");
const item14 = document.getElementById("item14");
const item15 = document.getElementById("item15");
const item16 = document.getElementById("item16");
const item17 = document.getElementById("item17");
const item18 = document.getElementById("item18");
const item19 = document.getElementById("item19");
const item20 = document.getElementById("item20");

let currentItem;

gridItems = Array.from(gridItems);

// 버튼에 이벤트 부여
const handleTextBtn = () => {
  controlBtns = Array.from(controlBtns);
  controlBtns.map((item) => {
    item.addEventListener("click", changeTextBtn);
  });
};

// 버튼 내용 변경 함수
const changeTextBtn = (e) => {
  currentItem = e.target.closest(".grid-item");
  if (e.target.classList.contains("minimize")) {
    e.target.innerText = "최소화";
    /*e.target.innerContent = `<i class="fa fa-window-restore"></i>`;   //최소화 "최소화"*/
    e.target.classList.add("maximize");
    e.target.classList.remove("minimize");
    handleMaxWindow(currentItem);
  } else {
    e.target.innerText = "최대화";
    /*e.target.innerContent = `<i class="fa fa-window-maximize"></i>`;   //최대화 "최대화"*/
    e.target.classList.add("minimize");
    e.target.classList.remove("maximize");
    handleMinWindow(currentItem);
  }
};

// 최대화 함수
const handleMaxWindow = (item) => {
  gridItems.map((gridItem) => {
    gridItem.id !== item.id
      ? (gridItem.style.display = "none")
      : (gridItem.style.display = "block");
  });

  item.style.width = "100%";
  item.style.height = "100vh";
};

// 최소화 함수
const handleMinWindow = (item) => {
  gridItems.map((gridItem) => {
    gridItem.style.display = "none";
    gridItem.style.width = "50%";
    gridItem.style.height = "47vh";
  });

  siteChkArr.map(item => {
    if(item.checked === true){
      if (item.value === 'daum') {
        item0.style.display = 'block';
      } else if (item.value === 'google') {
        item1.style.display = 'block';
      } else if (item.value === 'naver') {
        item7.style.display = 'block';
      } else if (item.value === 'dbpedia') {
        item2.style.display = 'block';
      } else if (item.value === 'lod') {
        item3.style.display = 'block';
      } else if (item.value === 'viaf') {
        item4.style.display = 'block';
      } else if (item.value === 'lc') {
        item5.style.display = 'block';
      } else if (item.value === 'kri') {
        item6.style.display = 'block';
      } else if (item.value === 'uci') {
        item19.style.display = 'block';
      } else if (item.value === 'riss') {
        item20.style.display = 'block';
      } else if (item.value === 'kobis') {
        item10.style.display = 'block';
      } else if (item.value === 'movieactor') {
        item17.style.display = 'block';
      } else if (item.value === 'cine21') {
        item18.style.display = 'block';
      } else if (item.value === 'fkmp') {
        item8.style.display = 'block';
      } else if (item.value === 'komca') {
        item9.style.display = 'block';
      } else if (item.value === 'vibe') {
        item11.style.display = 'block';
      } else if (item.value === 'genie') {
        item12.style.display = 'block';
      } else if (item.value === 'melon') {
        item13.style.display = 'block';
      } else if (item.value === 'maniadb') {
        item14.style.display = 'block';
      } else if (item.value === 'musicbrainz') {
        item15.style.display = 'block';
      } else if (item.value === 'kmdc') {
        item16.style.display = 'block';
      }
    }
  });
};

// 버튼 내용 변경 함수 실행 시켜서 이벤트 부여하는 것
handleTextBtn();


