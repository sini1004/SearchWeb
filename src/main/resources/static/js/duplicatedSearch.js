let table;

// 가중치
function submitWeight(data) {
    // console.log('weightSetting', localStorage.getItem('weightSetting'));
    const weightSetting = JSON.parse(localStorage.getItem('weightSetting') ?? '{"fieldOfActivity":"1","create":"1","birthYear":"1","deathYear":"1","source":"1","field035":"1","corporateName":"1"}');
    console.log('weightSetting', weightSetting);
    const result = Object.values(data).reduce((acc, array, idx) => {
        const fieldOfActivity = array[4] * Number(weightSetting.fieldOfActivity);
        const create = array[5] * Number(weightSetting.create);
        const birthYear = array[6] * Number(weightSetting.birthYear);
        const deathYear = array[7] * Number(weightSetting.deathYear);
        const source = array[8] * Number(weightSetting.source);
        const field035 = array[9] * Number(weightSetting.field035);
        const corporateName = array[10] * Number(weightSetting.corporateName);
        const total = fieldOfActivity + create + birthYear + deathYear + source + field035 + corporateName;

        // console.log('array', array);

        acc[idx] = [...array.slice(0, 3), total, fieldOfActivity, create, birthYear, deathYear, source, field035, corporateName];
        return acc;
    }, {});

    return result;
}

async function submit(input) {
    // 로딩 표시
    const loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'flex';

    // input submit 할 때 table 초기화
    // document.querySelector(".testTable tbody").textContent = "";
    if ($.fn.DataTable.isDataTable('#testTable')) {
        $('#testTable').DataTable().clear().destroy();
    }

    // 입력값 전송
    const data = await fetch("test", {method: "POST", body: input}).then(
        (d) => d?.json()
    );
    // console.log('data', data);

    // 로딩 숨기기
    loadingDiv.style.display = 'none';

    // 가중치 부여
    const refineData = submitWeight(data.resultData);
    console.log('refineData', refineData);
    console.log("input: " + input);

    // table 생성
    for (let i = 0; i < Object.keys(refineData).length; i++) {
        const table = document.querySelector(".testTable tbody");
        const row = document.createElement("tr");
        for (let j = 0; j < refineData["0"].length; j++) {
            const myData = document.createElement("td");

            // 링크 생성
            if (j === 1 || j === 2) {
                const link = document.createElement("a");
                link.textContent = refineData[i][j].replace('http://lod.nl.go.kr/resource/', 'nlk:');
                link.setAttribute("href", refineData[i][j]);
                link.setAttribute("target", "_blank");
                link.style.display = "block";
                myData.append(link);
            } else {
                myData.textContent = refineData[i][j];
            }
            row.appendChild(myData);
        }
        const btn = document.createElement("td");
        btn.className = 'dt-control';
        row.insertBefore(btn, row.firstChild);
        table.appendChild(row);
    }

    const attr = data.selectedProps;
    const attrFieldOfActivity = "http://lod.nl.go.kr/ontology/fieldOfActivity";
    const attrCreate = "http://lod.nl.go.kr/ontology/create";
    const attrBirthYear = "http://lod.nl.go.kr/ontology/birthYear";
    const attrDeathYear = "http://lod.nl.go.kr/ontology/deathYear";
    const attrSource = "http://purl.org/dc/elements/1.1/source";
    const attrField035 = "http://lod.nl.go.kr/ontology/field035";
    const attrCorporateName = "http://lod.nl.go.kr/ontology/corporateName";

    // console.log("attr", attr); // uri 별 lod
    // console.log("결과값 행 갯수", Object.keys(data.resultData).length);
    // console.log("저자1", data.resultData[0][1]);
    // console.log("저자2", data.resultData[0][2]);

    let printFieldOfActivity = [];
    let printCreate = [];
    let printBirthYear = [];
    let printDeathYear = [];
    let printSource = [];
    let printField035 = [];
    let printCorporateName = [];
    for (let i = 0; i < Object.keys(data.resultData).length; i++) {
        const author1 = attr[data.resultData[i][1]];
        const author2 = attr[data.resultData[i][2]];

        if (author1.hasOwnProperty(attrFieldOfActivity) && author2.hasOwnProperty(attrFieldOfActivity)) {
            author1[attrFieldOfActivity].filter(v => author2[attrFieldOfActivity].includes(v)).length === 0
                ? printFieldOfActivity.push("-")
                : printFieldOfActivity.push(author1[attrFieldOfActivity].filter(v => author2[attrFieldOfActivity].includes(v))); // 배열 중 일치하는 값 출력
        } else {
            printFieldOfActivity.push("-");
        }

        if (author1.hasOwnProperty(attrCreate) && author2.hasOwnProperty(attrCreate)) {
            author1[attrCreate].filter(v => author2[attrCreate].includes(v)).length === 0
                ? printCreate.push("-")
                : printCreate.push(author1[attrCreate].filter(v => author2[attrCreate].includes(v))); // 배열 중 일치하는 값 출력
        } else {
            printCreate.push("-");
        }

        if (author1.hasOwnProperty(attrBirthYear) && author2.hasOwnProperty(attrBirthYear)) {
            author1[attrBirthYear].filter(v => author2[attrBirthYear].includes(v)).length === 0
                ? printBirthYear.push("-")
                : printBirthYear.push(author1[attrBirthYear].filter(v => author2[attrBirthYear].includes(v))); // 배열 중 일치하는 값 출력
        } else {
            printBirthYear.push("-");
        }

        if (author1.hasOwnProperty(attrDeathYear) && author2.hasOwnProperty(attrDeathYear)) {
            author1[attrDeathYear].filter(v => author2[attrDeathYear].includes(v)).length === 0
                ? printDeathYear.push("-")
                : printDeathYear.push(author1[attrDeathYear].filter(v => author2[attrDeathYear].includes(v))); // 배열 중 일치하는 값 출력
        } else {
            printDeathYear.push("-");
        }

        if (author1.hasOwnProperty(attrSource) && author2.hasOwnProperty(attrSource)) {
            author1[attrSource].filter(v => author2[attrSource].includes(v)).length === 0
                ? printSource.push("-")
                : printSource.push(author1[attrSource].filter(v => author2[attrSource].includes(v))); // 배열 중 일치하는 값 출력
        } else {
            printSource.push("-");
        }

        if (author1.hasOwnProperty(attrField035) && author2.hasOwnProperty(attrField035)) {
            author1[attrField035].filter(v => author2[attrField035].includes(v)).length === 0
                ? printField035.push("-")
                : printField035.push(author1[attrField035].filter(v => author2[attrField035].includes(v))); // 배열 중 일치하는 값 출력
        } else {
            printField035.push("-");
        }

        if (author1.hasOwnProperty(attrCorporateName) && author2.hasOwnProperty(attrCorporateName)) {
            author1[attrCorporateName].filter(v => author2[attrCorporateName].includes(v)).length === 0
                ? printCorporateName.push("-")
                : printCorporateName.push(author1[attrCorporateName].filter(v => author2[attrCorporateName].includes(v))); // 배열 중 일치하는 값 출력
        } else {
            printCorporateName.push("-");
        }
        // console.log("printFieldOfActivity", printFieldOfActivity);
        // console.log("printCreate", printCreate);
        // console.log("printBirthYear", printBirthYear);
        // console.log("printDeathYear", printDeathYear);
        // console.log("printSource", printSource);
        // console.log("printField035", printField035);
        // console.log("printCorporateName", printCorporateName);
    }

    // Accordion에 넣을 데이터 포맷팅
    function format(d) {
        return (
            '<dl>' +
            '<dt>활동영역 (nlon:fieldOfActivity):</dt>' +
            '<dd>' +
            printFieldOfActivity[d] + '<br><br>' +
            '</dd>' +
            '<dt>저작 (nlon:create):</dt>' +
            '<dd>' +
            printCreate[d] + '<br><br>' +
            '</dd>' +
            '<dt>출생연도 (nlon:birthYear):</dt>' +
            '<dd>' +
            printBirthYear[d] + '<br><br>' +
            '</dd>' +
            '<dt>사망연도 (nlon:deathYear):</dt>' +
            '<dd>' +
            printDeathYear[d] + '<br><br>' +
            '</dd>' +
            '<dt>원천 (dc:source):</dt>' +
            '<dd>' +
            printSource[d] + '<br><br>' +
            '</dd>' +
            '<dt>협력기관번호 (KORMARC 035):</dt>' +
            '<dd>' +
            printField035[d] + '<br><br>' +
            '</dd>' +
            '<dt>관련단체 (nlon:corporateName):</dt>' +
            '<dd>' +
            printCorporateName[d] + '<br><br>' +
            '</dd>' +
            '</dl>'
        );
    }

    // Accordion에 이벤트 리스너 추가
    $('#testTable tbody').off('click').on('click', 'td.dt-control', function () {
        const tr = $(this).closest('tr');
        const row = table.row(tr);

        if (row.child.isShown()) { // 아코디언 닫기
            row.child.hide();
        } else { // 아코디언 열기
            row.child(format(row["0"])).show();
        }
    });

    // DataTable 설정
    table = $("#testTable").DataTable({
        "destroy": true,
        "lengthMenu": [
            [-1, 10, 25, 50, 100],
            ["전체", 10, 25, 50, 100]
        ],
        "searching": false,
        "language": {
            "decimal": "",
            "emptyTable": "데이터가 없습니다.",
            "info": "_START_ - _END_ (총 _TOTAL_ 건)",
            "infoEmpty": "0명",
            "infoFiltered": "(전체 _MAX_ 건 중 검색결과)",
            "infoPostFix": "",
            "thousands": ",",
            "lengthMenu": "_MENU_ 개씩 보기",
            "loadingRecords": "로딩 중...",
            "processing": "처리 중...",
            "search": "검색",
            "zeroRecords": "검색된 데이터가 없습니다.",
            "paginate": {
                "first": "첫 페이지",
                "last": "마지막 페이지",
                "next": "다음",
                "previous": "이전"
            },
            "aria": {
                "sortAscending": " : 오름차순 정렬",
                "sortDescending": " : 내림차순 정렬"
            }
        },
        order: [
            [1, 'asc']
        ],
        "columnDefs": [{
            "targets": 'no-sort',
            "orderable": false,
        }]
    });
}

// 검색 버튼 이벤트
function events() {
    document.querySelector('[name="search"]').addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            submit(e.target.value);
        }
    });

    document.querySelector('[name="btn-search"]').addEventListener("click", function () {
        submit(document.querySelector('[name="search"]').value);
    });

    document.querySelector(".weightSettingBtn").addEventListener('click', function () {
        // 1. form 태그 속성 안의 input 값 가져오기
        const form = document.querySelector('form[name="weightSetting"]');
        const fieldOfActivity = form.querySelector('input#fieldOfActivity').value ?? 1;
        const create = form.querySelector('input#create').value ?? 1;
        const birthYear = form.querySelector('input#birthYear').value ?? 1;
        const deathYear = form.querySelector('input#deathYear').value ?? 1;
        const source = form.querySelector('input#source').value ?? 1;
        const field035 = form.querySelector('input#field035').value ?? 1;
        const corporateName = form.querySelector('input#corporateName').value ?? 1;

        // 2. localStorage에 저장
        localStorage.setItem('weightSetting', JSON.stringify({
            fieldOfActivity,
            create,
            birthYear,
            deathYear,
            source,
            field035,
            corporateName
        }));

        // 3. '적용' 누르면 반영된 값 리로딩
        submit(document.querySelector('[name="search"]').value);
    });
}

// 숫자 입력범위 제한
document.querySelectorAll('input[class="form-control"]').forEach((num) => {
    num.addEventListener("keyup", function () {
        const val = this.value;

        // 0 ~ 3 사이로 제한
        if (val < 0 || val > 3) {
            alert("0 ~ 3 사이의 숫자를 입력해주세요.");
            this.value = '';
        }
    });
});

window.onload = function () {
    events();

    // onload 시 modal에 localStorage 값 넣기
    const weightSetting = JSON.parse(localStorage.getItem('weightSetting') ?? '{"fieldOfActivity":"1","create":"1","birthYear":"1","deathYear":"1","source":"1"}');
    if (Object.keys(weightSetting).length > 0) {
        const form = document.querySelector('form[name="weightSetting"]');
        form.querySelector('input#fieldOfActivity').value = weightSetting.fieldOfActivity;
        form.querySelector('input#create').value = weightSetting.create;
        form.querySelector('input#birthYear').value = weightSetting.birthYear;
        form.querySelector('input#deathYear').value = weightSetting.deathYear;
        form.querySelector('input#source').value = weightSetting.source;
        form.querySelector('input#field035').value = weightSetting.source;
        form.querySelector('input#corporateName').value = weightSetting.source;
    }
}