let inputWord;
let query;
let newWindow;
let siteChkArr = document.querySelectorAll(".checkSite");
siteChkArr = Array.from(siteChkArr);

//다음
function daumNew() {
  inputWord = document.getElementById('word').value;
  newWindow = window.open(`https://search.daum.net/search?nil_suggest=btn&w=tot&DA=SBC&q=${inputWord}`, "_blank");
}

//구글
function googleNew() {
  inputWord = document.getElementById('word').value;
  newWindow = window.open(`https://www.google.com/search?q=${inputWord}&igu=1`, "_blank");
}

function changeIframeUrl2() {
  dbPediaJson();
  document.getElementById("item2").style.display = 'block'; // 추가
}

//디비피디아
let en = /[a-zA-Z]/; //영어
let ko = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/; //한글
function dbpediaNew(){
	inputWord = document.getElementById('word').value;
	let lang = '';
	
  	//영어 체크하고 싶을 때
	if(en.test(inputWord)){
		lang = '@en';
	}
	//한글 체크하고 싶을 때
	if(ko.test(inputWord)){
		lang = '@ko';
	}

	query = `select * where {
	    ?s rdfs:label '${inputWord}' ${lang} .
	    ?s rdf:type foaf:Person . 
	    optional { ?s dbo:birthDate ?birthDate }
	    optional { ?s dbo:birthPlace ?birthPlace }
	    optional { ?s dbo:citizenship ?citizenship }
	    optional { ?s dbo:almaMater ?almaMater }
	  }`;
	newWindow = window.open(`https://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=${query}&format=text%2Fhtml&timeout=10000&signal_void=on&signal_unconnected=on`, "_blank");
}

//네이버
function naverNew() {
  inputWord = document.getElementById('word').value;
  newWindow = window.open(`https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=0&ie=utf8&query=${inputWord}`, "_blank");
}

// LOD
function lodNew(){
  inputWord = document.getElementById('word').value;
  newWindow = window.open(`https://lod.nl.go.kr/sparql?query=prefix+rdf%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%0D%0Aprefix+owl%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2002%2F07%2Fowl%23%3E%0D%0Aprefix+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0D%0Aprefix+nlon%3A+%3Chttp%3A%2F%2Flod.nl.go.kr%2Fontology%2F%3E%0D%0Aselect+*+where+%7B+%0D%0A%3Fs+rdfs%3Alabel+%27${inputWord}%27+.+%0D%0A%3Fs+rdf%3Atype+nlon%3AAuthor+.+%0D%0Aoptional+%7B+%3Fs+nlon%3AbirthYear+%3FbirthYear+%7D+%0D%0Aoptional+%7B+%3Fs+%3Chttp%3A%2F%2Fschema.org%2FbirthPlace%3E+%3FbirthPlace+%7D+%0D%0Aoptional+%7B+%3Fs+nlon%3AfieldOfActivity+%3FfieldOfActivity+%7D+%0D%0Aoptional+%7B+%3Fs+%3Chttp%3A%2F%2Fschema.org%2FjobTitle%3E+%3FjobTitle+%7D+%0D%0Aoptional+%7B+%3Fs+owl%3AsameAs+%3Fsameas+%7D+%0D%0A%7D++order+by+%3Fs+&format=html&request_method=get`, "_blank")
}

// VIAF
function viafNew(){
  inputWord = document.getElementById('word').value;
  newWindow = window.open(`https://viaf.org/viaf/search?query=cql.any%20all%20%22${inputWord}%22&sortKeys=holdingscount&httpAccept=text/html`, "_blank")
}

// LC
function lcNew(){
  inputWord = document.getElementById('word').value;
  newWindow = window.open(`https://id.loc.gov/search/?q=cs:http://id.loc.gov/authorities/names&q=${inputWord}`, "_blank")
}

// KRI
function kriNew() {
  inputWord = document.getElementById('word').value;
  newWindow = window.open(`https://www.kri.go.kr/kri2`, "_blank");
}

function fkmpNew() {
    inputWord = document.getElementById('word').value;
    newWindow = window.open(`https://www.fkmp.kr/member/Member/search_song/?start_year=&end_year=&main_search_type=f_artistsch&main_search_val=${inputWord}&order=I_T_TSONG_ISSUEDATE`, "_blank");
}

function komcaNew() {
    inputWord = document.getElementById('word').value;
    document.getElementById('author').setAttribute('value', inputWord);
    const pop_title = "newWindow";
    window.open("", pop_title);
    let memForm = document.memForm;
    memForm.target = pop_title;
    memForm.action = `https://www.komca.or.kr/srch2/srch_01.jsp`
    memForm.submit();
}

function kobisNew() {
    inputWord = document.getElementById('word').value;
    newWindow = window.open(`https://www.kobis.or.kr/kobis/business/mast/peop/searchPeopleList.do?sPeopleNm=${inputWord}`, "_blank");
}

function vibeNew() {
    inputWord = document.getElementById('word').value;
    newWindow = window.open(`https://vibe.naver.com/search?query=${inputWord}`, "_blank");
}

function genieNew() {
    inputWord = document.getElementById('word').value;
    newWindow = window.open(`https://www.genie.co.kr/search/searchMain?query=${inputWord}`, "_blank");
}

function melonNew() {
    inputWord = document.getElementById('word').value;
    newWindow = window.open(`https://www.melon.com/search/total/index.htm?q=${inputWord}&section=&mwkLogType=T`, "_blank");
}

function maniadbNew() {
    inputWord = document.getElementById('word').value;
    newWindow = window.open(`https://www.maniadb.com/search/${inputWord}/?sr=P`, "_blank");
}

function musicbrainzNew() {
    inputWord = document.getElementById('word').value;
    newWindow = window.open(`https://musicbrainz.org/search?query=${inputWord}&type=artist&method=indexed`, "_blank");
}

function kmdcNew() {
    inputWord = document.getElementById('word').value;
    newWindow = window.open(`https://k-pop.or.kr/search/?keyword=${inputWord}`, "_blank");
}

function movieactorNew() {
    inputWord = document.getElementById('word').value;
    newWindow = window.open(`http://www.movieactor.or.kr/bbs/board.php?bo_table=memberintro&sca=&sop=and&sfl=wr_subject&stx=${inputWord}`, "_blank");
}

function cine21New() {
    inputWord = document.getElementById('word').value;
    newWindow = window.open(`http://www.cine21.com/search/person/?q=${inputWord}`, "_blank");
}

function uciNew() {
    inputWord = document.getElementById('word').value;
    newWindow = window.open(`https://www.uci.or.kr/metadata/search?q=${inputWord}`, "_blank");
}

function rissNew() {
    inputWord = document.getElementById('word').value;
    newWindow = window.open(`https://www.riss.kr/search/Search.do?colName=all&isDetailSearch=N&searchGubun=true&oldQuery=&sflag=1&fsearchMethod=search&isFDetailSearch=N&searchQuery=${inputWord}&kbid=&pageNumber=1&query=${inputWord}`, "_blank");
}

function getCheckboxValue() {
    // 검색 시 창 크기 초기화
    let currentBtn = document.querySelectorAll('.controlBtn');
    let currentWindow = document.querySelectorAll('.grid-item');
    for(let i = 0; i < currentBtn.length; i++) {
        if(currentBtn[i].classList.contains('maximize')) {
            currentBtn[i].innerText = '최대화';
            currentBtn[i].classList.add('minimize');
            currentBtn[i].classList.remove('maximize');
            handleMinWindow(currentWindow[i]);
        }
    }
	/* 검색 시 체크안된 div display:none */
  	//displayNone(); // 추가
  	checkNo();

    siteChkArr.map(item => {
        if(item.checked === true){
            if (item.value === 'daum') {
                daumNew();
            } else if (item.value === 'google') {
                googleNew();
            } else if (item.value === 'naver') {
                naverNew();
            } else if (item.value === 'dbpedia') {
                dbpediaNew();
            } else if (item.value === 'lod') {
                lodNew();
            } else if (item.value === 'viaf') {
                viafNew();
            } else if (item.value === 'lc') {
                lcNew();
            } else if (item.value === 'uci') {
                uciNew();
            } else if (item.value === 'riss') {
                rissNew();
            } else if (item.value === 'kri') {
                kriNew();
            } else if (item.value === 'kobis') {
                kobisNew();
            } else if (item.value === 'movieactor') {
                movieactorNew();
            } else if (item.value === 'cine21') {
                cine21New();
            } else if (item.value === 'fkmp') {
                fkmpNew();
            } else if (item.value === 'komca') {
                komcaNew();
            } else if (item.value === 'vibe') {
                vibeNew();
            } else if (item.value === 'genie') {
                genieNew();
            } else if (item.value === 'melon') {
                melonNew();
            } else if (item.value === 'maniadb') {
                maniadbNew();
            } else if (item.value === 'musicbrainz') {
                musicbrainzNew();
            } else if (item.value === 'kmdc') {
                kmdcNew();
            }
        }
    });
}

// checkbox 4개 까지만    
let siteCheckBox = document.querySelectorAll(".checkSite");
siteCheckBox = Array.from(siteCheckBox);

const handleInputCheck = (current) => {
  let chkCount = 0;
  siteCheckBox.map((item) => {
    item.checked && chkCount++;
  });

  if (chkCount > 4) {
    alert("4개까지만 체크 가능");
    current.target.checked = false;
  }
};

siteCheckBox.map((item) => {
  item.addEventListener("click", handleInputCheck);
});


/* 체크박스 다 체크 안됐을 때 안내창 */
function checkNo(){
	let check_box = document.querySelectorAll('input[name="site"]:checked').length;
	if(check_box === 0){
		alert('적어도 하나는 선택하여 주십시오.');
		return false;
	}
}


/* 새 창 열기 */ 
function openNewWindow(target) {
    let searchUrl;
    switch (target) {
        case "daum":
            searchUrl = `https://search.daum.net/search?nil_suggest=btn&w=tot&DA=SBC&q=${inputWord}`;
            break;
        case "google":
            searchUrl = `https://www.google.com/search?q=${inputWord}&igu=1`;
            break;
        case "naver":
            searchUrl = `https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=0&ie=utf8&query=${inputWord}`;
            break;
        case "dbpedia":
            searchUrl = `https://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=${query}&format=text%2Fhtml&timeout=10000&signal_void=on&signal_unconnected=on`;
            break;
        case "lod":
            searchUrl = `https://lod.nl.go.kr/sparql?query=prefix+rdf%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%0D%0Aprefix+owl%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2002%2F07%2Fowl%23%3E%0D%0Aprefix+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0D%0Aprefix+nlon%3A+%3Chttp%3A%2F%2Flod.nl.go.kr%2Fontology%2F%3E%0D%0Aselect+*+where+%7B+%0D%0A%3Fs+rdfs%3Alabel+%27${inputWord}%27+.+%0D%0A%3Fs+rdf%3Atype+nlon%3AAuthor+.+%0D%0Aoptional+%7B+%3Fs+nlon%3AbirthYear+%3FbirthYear+%7D+%0D%0Aoptional+%7B+%3Fs+%3Chttp%3A%2F%2Fschema.org%2FbirthPlace%3E+%3FbirthPlace+%7D+%0D%0Aoptional+%7B+%3Fs+nlon%3AfieldOfActivity+%3FfieldOfActivity+%7D+%0D%0Aoptional+%7B+%3Fs+%3Chttp%3A%2F%2Fschema.org%2FjobTitle%3E+%3FjobTitle+%7D+%0D%0Aoptional+%7B+%3Fs+owl%3AsameAs+%3Fsameas+%7D+%0D%0A%7D++order+by+%3Fs+&format=html&request_method=get`;
            // searchUrl = `https://lod.nl.go.kr/sparql?query=${lodQuery}+&format=html&request_method=get`;
            break;
        case "viaf":
            searchUrl = `https://viaf.org/viaf/search?query=cql.any%20all%20%22${inputWord}%22&sortKeys=holdingscount&httpAccept=text/html`;
            break;
        case "lc":
            searchUrl = `https://id.loc.gov/search/?q=cs:http://id.loc.gov/authorities/names&q=${inputWord}`;
            break;
        case "kri":
            searchUrl = `https://www.kri.go.kr/kri2`;
            break;
        case "uci":
            searchUrl = `https://www.uci.or.kr/metadata/search?q=${inputWord}`;
            break;
        case "riss":
            searchUrl = `https://www.riss.kr/search/Search.do?colName=all&isDetailSearch=N&searchGubun=true&oldQuery=&sflag=1&fsearchMethod=search&isFDetailSearch=N&searchQuery=${inputWord}&kbid=&pageNumber=1&query=${inputWord}`;
            break;
        case "kobis":
            searchUrl = `https://www.kobis.or.kr/kobis/business/mast/peop/searchPeopleList.do?sPeopleNm=${inputWord}`;
            break;
        case "movieactor":
            searchUrl = `http://www.movieactor.or.kr/bbs/board.php?bo_table=memberintro&sca=&sop=and&sfl=wr_subject&stx=${inputWord}`;
            break;
        case "cine21":
            searchUrl = `http://www.cine21.com/search/person/?q=${inputWord}`;
            break;
        case "fkmp":
            searchUrl = `https://www.fkmp.kr/member/Member/search_song/?start_year=&end_year=&main_search_type=f_artistsch&main_search_val=${inputWord}&order=I_T_TSONG_ISSUEDATE`;
            break;
        case "komca":
            // searchUrl = `https://www.fkmp.kr/member/Member/search_song/?start_year=&end_year=&main_search_type=f_artistsch&main_search_val=${inputWord}&order=I_T_TSONG_ISSUEDATE`;
            break;
        case "vibe":
            searchUrl = `https://vibe.naver.com/search?query=${inputWord}`;
            break;
        case "genie":
            searchUrl = `https://www.genie.co.kr/search/searchMain?query=${inputWord}`;
            break;
        case "melon":
            searchUrl = `https://www.melon.com/search/total/index.htm?q=${inputWord}&section=&mwkLogType=T`;
            break;
        case "maniadb":
            searchUrl = `https://www.maniadb.com/search/${inputWord}/?sr=P`;
            break;
        case "musicbrainz":
            searchUrl = `https://musicbrainz.org/search?query=${inputWord}&type=artist&method=indexed`;
            break;
        case "kmdc":
            searchUrl = `https://k-pop.or.kr/search/?keyword=${inputWord}`;
            break;
    }
    window.open(searchUrl, "_blank");
}





