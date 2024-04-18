let inputWord;
let query;
let siteChkArr = document.querySelectorAll(".checkSite");
siteChkArr = Array.from(siteChkArr);

function displayNone() { // 추가
    gridItems.map((gridItem) => {
        gridItem.style.display = "none";
    });
}

function changeIframeUrl0() {
  inputWord = document.getElementById('word').value;
  document.getElementById("frame0").src = `https://search.daum.net/search?nil_suggest=btn&w=tot&DA=SBC&q=${inputWord}`;
  document.getElementById("item0").style.display = 'block'; // 추가
}

function changeIframeUrl1() {
  inputWord = document.getElementById('word').value;
  document.getElementById("frame1").src = `https://www.google.com/search?q=${inputWord}&igu=1`;
  document.getElementById("item1").style.display = 'block'; // 추가
}

function changeIframeUrl2() {
  dbPediaJson();
  document.getElementById("item2").style.display = 'block'; // 추가
}

/*DBpedia*/

function dbPedia(json){
  let resultDatas = [];
  
  const heads = json.head.vars;
  const datas = json.results.bindings;

  //console.log("heads>>>", heads)
  //console.log("datas>>>", datas)

  const initData = heads.reduce((acc,curr) => ({...acc,[curr]:""}),{});

  const lastDatas = datas.reduce((prev,curr)=>{
    //초기 한번
    if(!prev.s){
      let next = {};
      for(key of heads){
        if(!curr[key]) next[key] = "";
        else next[key] = curr[key].value;
      }
      return next;
    }

    //그 이후, 기준은 S 
    if(prev.s === curr.s.value){  //s값이 같음 
      //console.log("prev,curr >>> ", prev.s, curr.s.value);

      let next = {};
      for(key of heads) {
        if(!curr[key]) next[key] = ""; //필드가 존재안하면? 빈값으로 채움
        else if(Array.isArray(prev[key])){ //필드가 여러 값인 배열이니?
          if(prev[key].includes(curr[key].value)) next[key] = prev[key];
          else next[key] = [...prev[key],curr[key].value];  
        }else { // 배열이 아니야
          if(prev[key] === curr[key].value) next[key] = prev[key];  
          else next[key] = [prev[key],curr[key].value];
        }
      }
      return next;
    }else {  //s값이 다름 
      resultDatas.push(prev);
    
      let next = {};
      for(key of heads){
        if(!curr[key]) next[key] = "";
        else next[key] = curr[key].value;
      }
      return next;
    }
      
  },initData);

  resultDatas.push(lastDatas);
  //console.log("resultData",resultDatas);

  createTable(heads,resultDatas);
}

function createTable(heads, datas) {
  document.getElementById('dbTheadTr').innerHTML = '';
  document.getElementById('dbTbody').innerHTML = '';

  const dbTheadTr = document.getElementById("dbTheadTr");
  for (head of heads) {
    const thead = document.createElement("th");
    thead.innerHTML = head;
    dbTheadTr.append(thead);
  }

  const dbTbody = document.getElementById('dbTbody');
  for (data of datas) {
    const tr = document.createElement('tr');

    let emptyCount = 0; // Count of '-' values in the row

    for (key of heads) {
      const td = document.createElement("td");
      if (Array.isArray(data[key])) {
        for (let item of data[key]) {
          if (item.match('http://')) {
            let link = document.createElement('a');
            link.textContent = item.replace('http://dbpedia.org/resource/', 'dbpedia:'); //새로넣음
            //link.textContent = item;
            link.setAttribute('href', item);
            link.setAttribute('target', "_blank");
            td.append(link); 
          } else {
            let span = document.createElement("span");
            span.append(item);
            td.append(span);
          }

          let br = document.createElement('br');
          td.append(br);
        }
      } else {
        if (data[key] && data[key].match('http://')) {
          let link = document.createElement('a');
          link.innerHTML = data[key].replace('http://dbpedia.org/resource/', 'dbpedia:'); //새로넣음
          //link.innerHTML = data[key];
          link.setAttribute('href', data[key]);
          link.setAttribute('target', "_blank");
          td.append(link);
        } else if (data[key]) {
          let span = document.createElement('span');
          span.append(data[key]);
          td.append(span);
        } else {
          td.innerHTML = '-';
          emptyCount++;
        }
      }
      tr.append(td);
    }

    // Merge the cells if all values are '-'
    if (emptyCount === heads.length) {
      const td = document.createElement("td");
      td.setAttribute('colspan', heads.length);
      td.innerHTML = '데이터없음';
      td.style.textAlign = 'center';
      tr.innerHTML = ''; // Clear the row contents
      tr.append(td);
    }

    dbTbody.append(tr);
  }
}

let en = /[a-zA-Z]/; //영어
let ko = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/; //한글

function dbPediaJson(){
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

  $.ajax({ 
    type:"get", 
    url:`https://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=${query}&format=application%2Fsparql-results%2Bjson&timeout=10000&signal_void=on&signal_unconnected=on`, //값을 가져올 경로
    dataType:"json",  
    async    : false,
    success: function(data){   
        console.log("통신성공");
        // console.log(query);
        dbPedia(data);
    },
    error:function(){		 
        console.log("통신에러");
    }
  });
}
/*DBpedia*/

// Naver
function changeIframeUrl3() {
  // inputWord = document.getElementById('word').value;
  // document.getElementById('frame3').src = `https://www.bing.com/search?q=${inputWord}&form=QBLH&sp=-1&lq=0&pq=${inputWord}&sc=10-3&qs=n&sk=&cvid=BB3A4200C313497F819D7702D6F3F35C&ghsh=0&ghacc=0&ghpl=`;
  document.getElementById("item7").style.display = 'block'; // 추가
}

function changeIframeUrl4() {
  document.getElementById('tableBody').textContent = "";
  inputWord = document.getElementById('word').value;
  const requestURL = `https://viaf.org/viaf/search?query=cql.any%20all%20"${inputWord}"&sortKeys=holdingscount&httpAccept=application/json&recordSchema=info:srw/schema/1/JSON`;
  let request = new XMLHttpRequest();
  request.open('GET', requestURL);
  request.responseType = 'json';
  request.send();
  request.onload = function() {
    const viafData = request.response;
    let viafDataResponse = viafData.searchRetrieveResponse.records;
    let viafDataRecordsHeading = [];
    let viafDataRecordsTitles = [];
    let viafDataRecordsType = [];
    let viafDataRecordsURL = [];

    if(viafDataResponse === undefined) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.setAttribute('colspan', '5');
        td.textContent = '데이터없음';
        td.style.textAlign = 'center';
        tr.appendChild(td);
        document.getElementById('tableBody').appendChild(tr);
    }

    for(let i = 0; i < viafDataResponse.length; i++) {
        // 표목
        let arrayHeading = [];
        if(viafDataResponse[i].record.recordData.mainHeadings.data.length > 0) {
            let text;
            for(let j = 0; j < viafDataResponse[i].record.recordData.mainHeadings.data.length; j++) {
                text = viafDataResponse[i].record.recordData.mainHeadings.data[j].text;
                arrayHeading.push(text);
            }
        } else {
            text = viafDataResponse[i].record.recordData.mainHeadings.data.text;
            arrayHeading.push(text);
        }

        viafDataRecordsHeading.push(arrayHeading);
        // console.log(viafDataRecordsHeading[i]);

        // 유형
        let arrayType = [];
        if(viafDataResponse[i].record.recordData.nameType != null) {
            arrayType.push(viafDataResponse[i].record.recordData.nameType);
        } else {
            arrayType.push("");
        }
        viafDataRecordsType.push(arrayType);
        // console.log(viafDataRecordsType[i]);

        // 제목 예시
        let arrayTitles = [];
        if(viafDataResponse[i].record.recordData.titles != null) {
            let title;

            if(Array.isArray(viafDataResponse[i].record.recordData.titles.work) == true) {
                for(let k = 0; k < viafDataResponse[i].record.recordData.titles.work.length; k++) {
                    title = viafDataResponse[i].record.recordData.titles.work[k].title;
                    arrayTitles.push(title);
                } 
            } else {
                if (viafDataResponse[i].record.recordData.nameType == "UniformTitleWork") {
                    title = "";
                    arrayTitles.push(title);
                } else {
                    title = viafDataResponse[i].record.recordData.titles.work.title;
                    arrayTitles.push(title);
                }
            }
        } else {
            title = "";
            arrayTitles.push(title);
        }
        
        viafDataRecordsTitles.push(arrayTitles);
        // console.log(viafDataRecordsTitles[i]);

        // URL
        let arrayURL = [];
        let value = viafDataResponse[i].record.recordData.Document[Object.keys(viafDataResponse[i].record.recordData.Document)[0]];
        if(value != null) {
            arrayURL.push(value);
        } else {
            arrayURL.push("");
        }
        viafDataRecordsURL.push(arrayURL);
        // console.log(value);
        // console.log(viafDataRecordsURL[i]);
    }
    
    for(let i = 0; i < viafDataRecordsHeading.length; i++) {
        const tableBody = document.getElementById('tableBody');
        const tableRow = document.createElement('tr');
        const myNumber = document.createElement('td');
        const myHeading = document.createElement('td');
        const myTitles = document.createElement('td');
        const myType = document.createElement('td');
        myNumber.textContent = [i + 1];
        const table = tableBody.appendChild(tableRow);
        table.appendChild(myNumber);
        
        for(let j = 0; j < viafDataRecordsHeading[i].length; j++) {
            let myLink = document.createElement('a');
            myLink.textContent = viafDataRecordsHeading[i][j];
            myLink.setAttribute('href', viafDataRecordsURL[i]);
            myLink.setAttribute('target', '_blank');
            myLink.style.display = "block";
            // console.log(myPara);
            myHeading.appendChild(myLink);
        }
        table.appendChild(myHeading);

        for(let j = 0; j < viafDataRecordsType[i].length; j++) {
            let myPara = document.createElement('p');
            myPara.textContent = viafDataRecordsType[i][j];
            // console.log(myPara);
            myType.appendChild(myPara);
        }
        table.appendChild(myType);

        for(let j = 0; j < viafDataRecordsTitles[i].length; j++) {
            let myPara = document.createElement('p');
            myPara.textContent = viafDataRecordsTitles[i][j];
            // console.log(myPara);
            myTitles.appendChild(myPara);
        }
        table.appendChild(myTitles);
    }
  }
  document.getElementById("item4").style.display = 'block'; // 추가
}

function changeIframeUrl5() {
  jsonTest();
  document.getElementById("item3").style.display = 'block'; // 추가
}

function changeIframeUrl6(){
	htmlParsing();
	document.getElementById("item5").style.display = 'block'; // 추가	
}

function changeIframeUrl7(){
    document.getElementById("item6").style.display = 'block'; // 추가
}

function changeIframeUrl8() {
    inputWord = document.getElementById('word').value;
    document.getElementById("frame8").src = `https://www.fkmp.kr/member/Member/search_song/?start_year=&end_year=&main_search_type=f_artistsch&main_search_val=${inputWord}&order=I_T_TSONG_ISSUEDATE`;
    document.getElementById("item8").style.display = 'block'; // 추가
}

function changeIframeUrl9() {
    inputWord = document.getElementById('word').value;
    document.getElementById('author').setAttribute('value', inputWord);
    let memForm = document.memForm;
    memForm.target = "frame9";
    memForm.action = `https://www.komca.or.kr/srch2/srch_01.jsp`
    memForm.submit();
    document.getElementById("item9").style.display = 'block'; // 추가
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

function changeIframeUrl10() {
    inputWord = document.getElementById('word').value;
    document.getElementById("frame10").src = `https://www.kobis.or.kr/kobis/business/mast/peop/searchPeopleList.do?sPeopleNm=${inputWord}`;
    document.getElementById("item10").style.display = 'block'; // 추가
}

function changeIframeUrl11() {
    inputWord = document.getElementById('word').value;
    document.getElementById("frame11").src = `https://vibe.naver.com/search?query=${inputWord}`;
    document.getElementById("item11").style.display = 'block'; // 추가
}

function changeIframeUrl12() {
    inputWord = document.getElementById('word').value;
    document.getElementById("frame12").src = `https://www.genie.co.kr/search/searchMain?query=${inputWord}`;
    document.getElementById("item12").style.display = 'block'; // 추가
}

function changeIframeUrl13() {
    inputWord = document.getElementById('word').value;
    document.getElementById("frame13").src = `https://www.melon.com/search/total/index.htm?q=${inputWord}&section=&mwkLogType=T`;
    document.getElementById("item13").style.display = 'block'; // 추가
}

function changeIframeUrl14() {
    inputWord = document.getElementById('word').value;
    document.getElementById("frame14").src = `https://www.maniadb.com/search/${inputWord}/?sr=P`;
    document.getElementById("item14").style.display = 'block'; // 추가
}

function changeIframeUrl15() {
    inputWord = document.getElementById('word').value;
    document.getElementById("frame15").src = `https://musicbrainz.org/search?query=${inputWord}&type=artist&method=indexed`;
    document.getElementById("item15").style.display = 'block'; // 추가
}

function changeIframeUrl16() {
    inputWord = document.getElementById('word').value;
    document.getElementById("frame16").src = `https://k-pop.or.kr/search/?keyword=${inputWord}`;
    document.getElementById("item16").style.display = 'block'; // 추가
}

function changeIframeUrl17() {
    inputWord = document.getElementById('word').value;
    document.getElementById("frame17").src = `http://www.movieactor.or.kr/bbs/board.php?bo_table=memberintro&sca=&sop=and&sfl=wr_subject&stx=${inputWord}`;
    document.getElementById("item17").style.display = 'block'; // 추가
}

function changeIframeUrl18() {
    inputWord = document.getElementById('word').value;
    document.getElementById("frame18").src = `http://www.cine21.com/search/person/?q=${inputWord}`;
    document.getElementById("item18").style.display = 'block'; // 추가
}

function changeIframeUrl19() {
    inputWord = document.getElementById('word').value;
    document.getElementById("frame19").src = `https://www.uci.or.kr/metadata/search?q=${inputWord}`;
    document.getElementById("item19").style.display = 'block'; // 추가
}

function changeIframeUrl20() {
    inputWord = document.getElementById('word').value;
    document.getElementById("frame20").src = `https://www.riss.kr/search/Search.do?colName=all&isDetailSearch=N&searchGubun=true&oldQuery=&sflag=1&fsearchMethod=search&isFDetailSearch=N&searchQuery=${inputWord}&kbid=&pageNumber=1&query=${inputWord}`;
    document.getElementById("item20").style.display = 'block'; // 추가
}

 function generateData(json) {
    let resultDatas = [];

    const heads = json.head.vars;
    const datas = json.results.bindings;
    
    const initData = heads.reduce((acc,curr) => ({...acc,[curr]:""}),{});
  
    const lastDatas = datas.reduce((prev,curr)=>{
      //초기 한번, (처음 공지영 세팅)
      if(!prev.s){
        let next = {};
        for(key of heads){
          if(!curr[key]) next[key] = "";
          else next[key] = curr[key].value;
        }
        return next;
      }

      //그 이후, 기준은 S(인물을 식별하는 uri(키))
      if(prev.s === curr.s.value){  //s값이 같음, 계속 동일한 공지영
        let next = {};
        for(key of heads) {
          if(!curr[key]) next[key] = ""; //필드가 존재안하면? 빈값으로 채움

          else if(Array.isArray(prev[key])){ //필드가 여러 값인 배열이니?
            if(prev[key].includes(curr[key].value)) next[key] = prev[key]; //배열에 현재 값이 존재하면 중복제거하기위해 전의 데이터 그대로 넘김.
            else next[key] = [...prev[key],curr[key].value];  //배열에 현재 값이 새로운 값이면 이전 배열에 새로운 값 추가.
          }else { // 배열이 아니야
            if(prev[key] === curr[key].value) next[key] = prev[key];  //이전 값이 현재 값과 같으면 중복이므로 이전 값 세팅
            else next[key] = [prev[key],curr[key].value];//이전 값이 현재 값과 다르면 현재 값 세팅
          }
        }
        return next;
      }else {  //s값이 다름(공지영 -> 다른 공지영)
        resultDatas.push(prev);
      
        let next = {};
        for(key of heads){
          if(!curr[key]) next[key] = "";
          else next[key] = curr[key].value;
        }
        return next;
      }
        
    },initData);
    resultDatas.push(lastDatas);
    //console.log("resultData",resultDatas);

    createUI(heads,resultDatas);
  }
  
  function createUI(heads,datas){
	document.getElementById('lodTheadTr').innerHTML = '';
	document.getElementById('lodTbody').innerHTML = '';

    const lodTheadTr = document.getElementById("lodTheadTr");
    for(head of heads){
      const thead = document.createElement("th");
      thead.innerHTML = head;
      lodTheadTr.append(thead);
    }

    const lodTbody = document.getElementById("lodTbody");
    for(const data of datas){
      const tr = document.createElement("tr");
		
	  let emptyCount = 0; // Count of '-' values in the row

      for(key of heads){
        let td = document.createElement("td");
        
        if(Array.isArray(data[key])){			
          //td.textContent = data[key].join(",");
          
          //data[key]가 배열이라면 for loop을 실행할 것이고, 배열이 아니면 건너 뛸 것이야.
			for(let item of data[key]) {
				if(item.match('http://')) {
					//console.log(data[key], "data[key]");
					
					let link = document.createElement('a');
            		let linkText = item.replace('http://lod.nl.go.kr/resource/', 'nlk:'); //새로추가
            		link.textContent = linkText; //새로추가
					//link.textContent = item;
					link.setAttribute('href', item);
					link.setAttribute('target', "_blank");
											
					td.append(link);						
						
				}else {
					let span = document.createElement("span");
					span.append(item);
					td.append(span);
				}
				
				let br = document.createElement('br');
				td.append(br);
			}
 
        }else{
			if(data[key] && data[key].match('http://')){
				let link = document.createElement('a');
				let linkText = data[key].replace('http://lod.nl.go.kr/resource/', 'nlk:'); //새로추가
          		link.textContent = linkText; //새로추가						
				//link.textContent = data[key];
				link.setAttribute('href', data[key]);
				link.setAttribute('target', "_blank");
										
				td.append(link);
			}else if(data[key]){
				let span = document.createElement("span");
				span.append(data[key]);
				td.append(span);
			}else {	
	           //td.innerHTML = data[key] ? data[key] : "-";		
	           td.innerHTML = '-';
	           emptyCount++;	
			}
        }
        tr.append(td);
      }

	    if (emptyCount === heads.length) {
	      const td = document.createElement("td");
	      console.log(">>>>>>>>>>", td);
	      td.setAttribute('colspan', heads.length);
	      td.innerHTML = '데이터없음';
	      td.style.textAlign = 'center';
	      tr.innerHTML = ''; // Clear the row contents
	      tr.append(td);
	    }
    
      lodTbody.append(tr);
    }
  }

  function jsonTest(){
    inputWord = document.getElementById('word').value;  
    var requestURL = `http://lod.nl.go.kr/sparql`;

    $.ajax({
      url : `sparql`,
      type: "POST",
      async : false,
      dataType: "json",
        data : {input : inputWord},
      //contentType : "application/x-www-form-urlencoded;charset=UTF-8",
      success:function(result){
          //console.log(result);
          generateData(result);
      },
      error:function(xhr,status,error){
      console.log('error : ',error,status);
      }
    });
  }
  
/* LC */ 
function htmlParsing() {
    inputWord = document.getElementById('word').value;
    document.getElementById('lcTable').textContent = "";

    $.ajax({
        url : `parser`,
        type: "POST",
        async : false,
        data : {"input" : inputWord},
        contentType : "application/x-www-form-urlencoded;charset=UTF-8",
        dataType: "json",
        success:function(result) {
            //console.log(">>>>>>>>>>>>>> ",result.table)
            //generateData(result);
            let html = "<thead>"
                            +"<tr>"
                                +"<th>Label</th>"
                                +"<th>Dataset</th>"
                                +"<th>Type</th>"
                                +"<th>Subdivision</th>"
                                +"<th>Identifier</th>"
                            +"</tr>"
                        +"</thead>";

            if (result && result.table) {
                html += "<tbody>" + result.table + "</tbody>";
            } else {
                html += "<tbody class='nodata'>"
                    + "<tr>"
                    + "<td colspan='5'>데이터없음</td>"
                    + "</tr>"
                    + "</tbody>";
            }

            $("#lcTable").append(html);

            let link = document.querySelectorAll('.tbody-group tr td a'); // <a> 태그 선택

            link.forEach((element, index) => {
                element.setAttribute('target', '_blank');
                return element.href = "https://id.loc.gov" + element.href.substring(element.href.indexOf('/authorities'));
            });
        },
        error:function(xhr,status,error) {
            console.log('error : ',error,status);
        }
    });
}
/* LC */


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
  	displayNone(); // 추가
  	checkNo();

	siteChkArr.map(item => {
        if(item.checked === true){
            if (item.value === 'daum') {
                changeIframeUrl0();
            } else if (item.value === 'google') {
                changeIframeUrl1();
            } else if (item.value === 'naver') {
                changeIframeUrl3();
            } else if (item.value === 'dbpedia') {
                changeIframeUrl2();
            } else if (item.value === 'lod') {
                changeIframeUrl5();
            } else if (item.value === 'viaf') {
                changeIframeUrl4();
            } else if (item.value === 'lc') {
                changeIframeUrl6();
            } else if (item.value === 'kri') {
                changeIframeUrl7();
            } else if (item.value === 'uci') {
                changeIframeUrl19();
            } else if (item.value === 'riss') {
                changeIframeUrl20();
            } else if (item.value === 'kobis') {
                changeIframeUrl10();
            } else if (item.value === 'movieactor') {
                changeIframeUrl17();
            } else if (item.value === 'cine21') {
                changeIframeUrl18();
            } else if (item.value === 'fkmp') {
                changeIframeUrl8();
            } else if (item.value === 'komca') {
                changeIframeUrl9();
            } else if (item.value === 'vibe') {
                changeIframeUrl11();
            } else if (item.value === 'genie') {
                changeIframeUrl12();
            } else if (item.value === 'melon') {
                changeIframeUrl13();
            } else if (item.value === 'maniadb') {
                changeIframeUrl14();
            } else if (item.value === 'musicbrainz') {
                changeIframeUrl15();
            } else if (item.value === 'kmdc') {
                changeIframeUrl16();
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
    if(target == 'komca') {
        komcaNew();
    } else {
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
}









