package com.example.searchWeb;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.Set;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.sparql.resultset.SPARQLResult;

import com.example.searchWeb.util.NlkAuthor;
import com.list.ontobase.client.query.SparqlQuery;

/**
 * 중복 저자 데이터를 검색하기 위한 클래스
 * 
 * @author ProDesk
 */
public class SearchDuplicateAuthor {
	private String ip; // Ontobase 아이피
	private int port; // Ontobase 포트
	private String serviceName; // Ontobase 서비스

	private List<String> properties; // 비교할 프라퍼티 목록
	private List<Integer> weights; // 프라퍼티 가중치(properties 의 순서와 동일하다고 가정)

	/**
	 * 생성자
	 * 
	 * @param ip          Ontobase 아이피
	 * @param port        Ontobase 포트
	 * @param serviceName Ontobase 서비스
	 * @param properties  비교할 프라퍼티 목록
	 * @param weights     프라퍼티 가중치(properties 의 순서와 동일하다고 가정)
	 */
	public SearchDuplicateAuthor(String ip, int port, String serviceName, List<String> properties,
			List<Integer> weights) {
		this.ip = ip;
		this.port = port;
		this.serviceName = serviceName;
		this.properties = properties;
		this.weights = weights;
	}

	/**
	 * 저자 리스트를 생성
	 * 
	 * @return 저자 리스트(URI)
	 * @throws Exception
	 */
	private List<String> getAuthors() throws Exception {
		List<String> authorList = new ArrayList<String>();

		SparqlQuery sq = null;
		try {
			sq = new SparqlQuery(ip, port, serviceName);
			StringBuffer sb = new StringBuffer();
			sb.append("select distinct ?o where {");// 734157
			sb.append(" ?s a <http://lod.nl.go.kr/ontology/Author> .");
			sb.append(" ?s <http://xmlns.com/foaf/0.1/name> ?o .");
			sb.append("}");
			SPARQLResult result = sq.execute(sb.toString());

			if (result == null) {
				throw new Exception("Error: SPARQLResult is null");
			}

			ResultSet rs = result.getResultSet();
			while (rs.hasNext()) {
				QuerySolution rb = rs.nextSolution();
				String o = rb.get("?o").toString();
				authorList.add(o);
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if (sq != null) {
				try {
					sq.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}

		return authorList;
	}

	/**
	 * 저자 맵을 생성
	 * 
	 * @param resource 저자 이름
	 * @return 저자 맵(URI, 저자 객체)
	 * @throws Exception
	 */
	private Map<String, NlkAuthor> createAuthorMap(String resource) throws Exception {
		Map<String, NlkAuthor> nameMap = new HashMap<String, NlkAuthor>();

		SparqlQuery sq = null;
		try {
			sq = new SparqlQuery(ip, port, serviceName);
			StringBuffer sb = new StringBuffer();
			sb.append("select ?s ?p ?o where {");
			sb.append(" ?s <http://xmlns.com/foaf/0.1/name> \"" + resource + "\" .");
			sb.append(" ?s ?p ?o .");
			sb.append(" filter (?p in (");
			for (int i = 0; i < this.properties.size(); i++) {
				if (i == 0)
					sb.append("<" + this.properties.get(i) + ">");
				else
					sb.append(",<" + this.properties.get(i) + ">");
			}
			sb.append("))} order by ?s");
			SPARQLResult result = sq.execute(sb.toString());

			if (result == null) {
				throw new Exception("Error: SPARQLResult is null");
			}

			String ps = "";
			Map<String, List<String>> props = null;

			ResultSet rs = result.getResultSet();
			while (rs.hasNext()) {
				QuerySolution rb = rs.nextSolution();
				String s = rb.get("?s").toString();
				String p = rb.get("?p").toString();
				String o = rb.get("?o").toString();

				if (ps.isEmpty()) {
					ps = s;
					props = new HashMap<String, List<String>>();
				}

				if (ps.equals(s) == false) {
					NlkAuthor obj = new NlkAuthor();
					obj.url = ps;
					obj.props = props;

					nameMap.put(ps, obj);

					ps = s;
					props = new HashMap<String, List<String>>();
				}

				if (props.containsKey(p)) {
					List<String> list = props.get(p);
					list.add(o);
				} else {
					List<String> list = new ArrayList<String>();
					list.add(o);
					props.put(p, list);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if (sq != null) {
				try {
					sq.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}

		return nameMap;
	}

	/**
	 * 프라퍼티들을 비교해서 중복 검사를 실행한다.
	 * 
	 * @param result 결과 맵(저자URI_저자URI, Map<프라퍼티, 개수>)
	 * @param map    저자 맵
	 * @param url    비교할 저자 URI
	 * @param author 비교할 저자 객체
	 */
	private void compare(Map<String, Map<String, Integer>> result, Map<String, NlkAuthor> map, String url,
			NlkAuthor author) {

		Iterator<String> iter = map.keySet().iterator();
		while (iter.hasNext()) {
			String n = iter.next();
			if (url.equals(n)) { // 같은 대상 스킵
				continue;
			}
			NlkAuthor value = map.get(n);

			// 프라퍼티별로 중복 검사
			for (String p : this.properties) {
				int count = 0;
				List<String> props = author.props.get(p);
				List<String> values = value.props.get(p);
				if (props != null && values != null) {
					for (String v : values) {
						for (String prop : props) {
							if (v.equals(prop)) {
								count++;
							}
						}
					}
				}

				String k = url + "_" + n;
				if (result.containsKey(k)) {
					Map<String, Integer> remap = result.get(k);
					remap.put(p, count);
				} else {
					Map<String, Integer> remap = new HashMap<String, Integer>();
					remap.put(p, count);
					result.put(k, remap);
				}
			}
		}
	}

	/**
	 * 중복 검사를 실행한다.
	 * 
	 * @param inputName   중복 검사할 저자 URI
	 * @param limit_score 점수 제한
	 * @param limit_top   추출 개수 제한(중복 개수가 많은 순서)
	 * @return 중복 결과
	 * @throws Exception
	 */
	private List<List<String>> runAuthor(String inputName, int limit_score, int limit_top) throws Exception {
		Map<String, NlkAuthor> map = createAuthorMap(inputName);

		// key: URI1_URI2, value: Map<프라퍼티, 중복개수>
		Map<String, Map<String, Integer>> result = new HashMap<String, Map<String, Integer>>();

		Iterator<String> it = map.keySet().iterator();
		while (it.hasNext()) {
			String url = it.next();
			NlkAuthor author = map.get(url);
			compare(result, map, url, author);
		}

		// 점수 계산
		Map<String, Integer> scoreMap = new HashMap<String, Integer>();
		Iterator<String> reit = result.keySet().iterator();
		while (reit.hasNext()) {
			String key = reit.next();// URI1_URI2
			Map<String, Integer> value = result.get(key);// Map<프라퍼티, 중복개수>
			int score = 0;
			for (int i = 0; i < this.properties.size(); i++) {
				if (value.containsKey(this.properties.get(i))) {
					int count = value.get(this.properties.get(i));
					score += count * this.weights.get(i);
				}
			}

			// 점수로 필터링
			if (limit_score <= score) {
				scoreMap.put(key, score);
			}
		}

		// 점수로 정렬
		List<Map.Entry<String, Integer>> entryList = new LinkedList<Map.Entry<String, Integer>>();
		entryList.addAll(scoreMap.entrySet());
		entryList.sort(Map.Entry.comparingByValue());
		String[] keys = null;

		List<List<String>> resultData = new ArrayList<>();
		Set<String> set = new HashSet<String>();
		for (Map.Entry<String, Integer> entry : entryList) {
			String key = entry.getKey();
			int score = entry.getValue();

			keys = key.split("_");

			// 중복 체크
			String invertkey = keys[1] + "_" + keys[0];
			if (set.contains(invertkey))
				continue;

			set.add(key);
			set.add(invertkey);

			Map<String, Integer> detail = result.get(key);
			int sum = 0;
			List<Integer> cntList = new ArrayList<Integer>();
			for (String p : this.properties) {
				int count = detail.get(p);
				sum += count;
				cntList.add(count);
			}

			ArrayList<String> data = new ArrayList<>();
			data.add(inputName);
			data.add(keys[0]);
			data.add(keys[1]);
			data.add(String.valueOf(score));
			data.add(String.valueOf(sum));
			for (int cnt : cntList) {
				data.add(String.valueOf(cnt));
			}
			resultData.add(data);
		}

		return resultData;
	}

	/**
	 * 중복 검사를 실행한다.
	 * 
	 * @param inputName   중복 검사할 저자 이름
	 * @param limit_score 점수 제한
	 * @param limit_top   추출 개수 제한(중복 개수가 많은 순서)
	 * @throws Exception
	 */
	public void run(int limit_score, int limit_top) throws Exception {
		// 우선순위 큐 (minimum heap) - 중복 개수로 체크
		PriorityQueue<List<List<String>>> pq = new PriorityQueue<>(Comparator.comparingInt(list -> list.size()));

		List<String> authorList = getAuthors();
		for (String author : authorList) {
			List<List<String>> result = runAuthor(author, limit_score, limit_top);
			pq.offer(result);

			// limit_top 제한
			if (pq.size() > limit_top) {
				pq.poll();
			}
		}

		// 폴더 생성
		String dir = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
		Path path = Paths.get(System.getProperty("user.dir"), dir);
		Files.deleteIfExists(path);
		Files.createDirectory(path);

		// 결과 저장
		int rank = pq.size();
		while (!pq.isEmpty()) {
			List<List<String>> result = pq.poll();
			String fileName = rank + "_" + result.get(0).get(0) + "(" + result.size() + ").csv";
			rank--;

			CSVPrinter fw = null;
			try {
				CSVFormat cf = CSVFormat.DEFAULT.builder().setDelimiter('\t')
						.setHeader("authorName", "author1", "author2", "score", "sum", "fieldOfActivity", "create",
								"birthYear", "deathYear", "source", "field035", "corporateName")
						.build();
				fw = cf.print(new File(path.toString() + File.separator + fileName), Charset.forName("UTF-8"));

				for (List<String> list : result) {
					String authorName = list.get(0);
					String author1 = list.get(1);
					String author2 = list.get(2);
					String score = list.get(3);
					String sum = list.get(4);
					String fieldOfActivity = list.get(5);
					String create = list.get(6);
					String birthYear = list.get(7);
					String deathYear = list.get(8);
					String source = list.get(9);
					String field035 = list.get(10);
					String corporateName = list.get(11);
					fw.printRecord(authorName, author1, author2, score, sum, fieldOfActivity, create, birthYear,
							deathYear, source, field035, corporateName);
				}
			} finally {
				if (fw != null) {
					try {
						fw.close();
					} catch (IOException e) {// ignore
					}
				}
			}
		}
	}

	/**
	 * help
	 */
	public static StringBuffer help;
	static {
		help = new StringBuffer();
		help.append("Help: 파라미터를 확인 해주세요.\\n");
		help.append("searchDuplicateAuthor :\n");
		help.append("[ob_ip] Ontobase 아이피\n");
		help.append("[ob_port] Ontobase 포트\n");
		help.append("[ob_serviceName] Ontobase 서비스\n");
		help.append("[wt_fieldOfActivity] fieldOfActivity 가중치\n");
		help.append("[wt_create] create 가중치\n");
		help.append("[wt_birthYear] birthYear 가중치\n");
		help.append("[wt_deathYear] deathYear 가중치\n");
		help.append("[wt_source] source 가중치\n");
		help.append("[wt_field035] field035 가중치\n");
		help.append("[wt_corporateName] corporateName 가중치\n");
		help.append("[limit_score] 점수 제한\n");
		help.append("[limit_top] 추출 개수 제한(중복 개수가 많은 순서)\n");
	}

	public static void main(String[] args) throws Exception {
		if (args.length < 12) {
			System.out.println("Please, check argument..");
			System.out.println(help.toString());
			System.exit(-1);
		}

		String ob_ip = args[0];
		int ob_port = Integer.parseInt(args[1]);
		String ob_serviceName = args[2];
		int wt_fieldOfActivity = Integer.parseInt(args[3]);
		int wt_create = Integer.parseInt(args[4]);
		int wt_birthYear = Integer.parseInt(args[5]);
		int wt_deathYear = Integer.parseInt(args[6]);
		int wt_source = Integer.parseInt(args[7]);
		int wt_field035 = Integer.parseInt(args[8]);
		int wt_corporateName = Integer.parseInt(args[9]);
		int limit_score = Integer.parseInt(args[10]);
		int limit_top = Integer.parseInt(args[11]);

		// 테스트 샘플
//		String ob_ip = "172.16.0.192";
//		int ob_port = 9966;
//		String ob_serviceName = "author";
//		int wt_fieldOfActivity = 1;
//		int wt_create = 1;
//		int wt_birthYear = 1;
//		int wt_deathYear = 1;
//		int wt_source = 1;
//		int wt_field035 = 1;
//		int wt_corporateName = 1;
//		int limit_score = 3;
//		int limit_top = 10;

		// 파라미터 검사
		if (wt_fieldOfActivity < 0 || wt_create < 0 || wt_birthYear < 0 || wt_deathYear < 0 || wt_source < 0
				|| wt_field035 < 0 || wt_corporateName < 0) {
			System.out.println("weight 값은 0 이상 이어야 합니다.");
		}
		if (limit_score < 0) {
			System.out.println("limit_score 값은 0 보다 커야 합니다.");
		}
		if (limit_top <= 0) {
			System.out.println("limit_top 값은 0 보다 커야 합니다.");
		}

		// 비교할 프라퍼티 목록
		List<String> properties = new ArrayList<String>();
		properties.add("http://lod.nl.go.kr/ontology/fieldOfActivity");
		properties.add("http://lod.nl.go.kr/ontology/create");
		properties.add("http://lod.nl.go.kr/ontology/birthYear");
		properties.add("http://lod.nl.go.kr/ontology/deathYear");
		properties.add("http://purl.org/dc/elements/1.1/source");
		properties.add("http://lod.nl.go.kr/ontology/field035");
		properties.add("http://lod.nl.go.kr/ontology/corporateName");

		// 프라퍼티 가중치(properties 의 순서와 동일하다고 가정)
		List<Integer> weights = new ArrayList<Integer>();
		weights.add(wt_fieldOfActivity);
		weights.add(wt_create);
		weights.add(wt_birthYear);
		weights.add(wt_deathYear);
		weights.add(wt_source);
		weights.add(wt_field035);
		weights.add(wt_corporateName);

		SearchDuplicateAuthor runner = new SearchDuplicateAuthor(ob_ip, ob_port, ob_serviceName, properties, weights);

		long start = System.currentTimeMillis();
		runner.run(limit_score, limit_top);
		long end = System.currentTimeMillis();

		System.out.println("finished...");
		System.out.println(">>> Response Time: " + (end - start) / 10.0 + " ms");
	}

}
