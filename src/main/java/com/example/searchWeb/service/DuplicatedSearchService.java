package com.example.searchWeb.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.sparql.resultset.SPARQLResult;
import org.springframework.stereotype.Service;

import com.example.searchWeb.util.NlkAuthor;
import com.list.ontobase.client.query.SparqlQuery;

@Service
public class DuplicatedSearchService {
	private static String ip = "172.16.0.192"; // Ontobase 아이피
	private static int port = 9966; // Ontobase 포트
	private static String serviceName = "author"; // Ontobase 서비스

	private static List<String> properties = new ArrayList<String>();
	{
		properties.add("http://lod.nl.go.kr/ontology/fieldOfActivity");
		properties.add("http://lod.nl.go.kr/ontology/create");
		properties.add("http://lod.nl.go.kr/ontology/birthYear");
		properties.add("http://lod.nl.go.kr/ontology/deathYear");
		properties.add("http://purl.org/dc/elements/1.1/source");
		properties.add("http://lod.nl.go.kr/ontology/field035");
		properties.add("http://lod.nl.go.kr/ontology/corporateName");
	}

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
			for (int i = 0; i < DuplicatedSearchService.properties.size(); i++) {
				if (i == 0)
					sb.append("<" + DuplicatedSearchService.properties.get(i) + ">");
				else
					sb.append(",<" + DuplicatedSearchService.properties.get(i) + ">");
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

	private void compare(Map<String, Map<String, Integer>> result, Map<String, NlkAuthor> map, String url,
			NlkAuthor author) {

		Iterator<String> iter = map.keySet().iterator();
		while (iter.hasNext()) {
			String n = iter.next();
			if (url.equals(n)) { // 같은 대상 스킵
				continue;
			}
			NlkAuthor value = map.get(n);

			for (String p : DuplicatedSearchService.properties) {
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

	public Map<String, Object> run(String inputName) throws Exception {
		Map<String, Object> responseResult = new HashMap<>();
		Map<String, Map<String, List<String>>> selectedProps = new HashMap<>();
		long start = System.currentTimeMillis();

		Map<String, NlkAuthor> map = createAuthorMap(inputName);
		System.out.println("map: " + map.size());

		Map<String, Map<String, Integer>> result = new HashMap<String, Map<String, Integer>>();

		Iterator<String> it = map.keySet().iterator();
		while (it.hasNext()) {
			String url = it.next();
			NlkAuthor author = map.get(url);

			compare(result, map, url, author);
		}

		// 가장 총합이 많은 것을 찾는 부분
		int top = 0;
		Map<String, Integer> totalMap = new HashMap<String, Integer>();
		Iterator<String> reit = result.keySet().iterator();
		while (reit.hasNext()) {
			String key = reit.next();

			Map<String, Integer> value = result.get(key);
			int total = 0;
			Iterator<String> kiter = value.keySet().iterator();
			while (kiter.hasNext()) {
				String k = kiter.next();
				total += value.get(k);
			}
			totalMap.put(key, total);

			if (top < total)
				top = total;
		}

		// sort
		Set<String> writeSet = new HashSet<String>();

		List<Map.Entry<String, Integer>> entryList = new LinkedList<Map.Entry<String, Integer>>();
		entryList.addAll(totalMap.entrySet());
		entryList.sort(Map.Entry.comparingByValue());
		String[] keys = new String[0];

		HashMap<Integer, ArrayList<String>> resultData = new HashMap<>();
		int i = 0; // index
		for (Map.Entry<String, Integer> entry : entryList) {
			String key = entry.getKey();
			int total = entry.getValue();

			if (total < top) // 최대 개수만 출력
				continue;

			keys = key.split("_");

			// 중복 체크
			String newkey = keys[1] + "_" + keys[0];
			if (writeSet.contains(newkey))
				continue;

			writeSet.add(key);
			writeSet.add(newkey);

			Map<String, Integer> detail = result.get(key);
			int sum = 0;
			List<Integer> cntList = new ArrayList<Integer>();
			for (String p : DuplicatedSearchService.properties) {
				int count = detail.get(p);
				sum += count;
				cntList.add(count);
			}

			selectedProps.put(keys[0], map.get(keys[0]).props);
			selectedProps.put(keys[1], map.get(keys[1]).props);

			ArrayList<String> data = new ArrayList<>();
			data.add(inputName);
			data.add(keys[0]);
			data.add(keys[1]);
			data.add(String.valueOf(sum));
			for (int cnt : cntList) {
				data.add(String.valueOf(cnt));
			}
			resultData.put(i, data);
			i++;
		}

		// print
		for (ArrayList<String> item : resultData.values()) {
			System.out.println(item);
		}

		long end = System.currentTimeMillis();
		System.out.println(">>> Response Time: " + (end - start) / 10.0 + " ms");

		responseResult.put("resultData", resultData);
		responseResult.put("selectedProps", selectedProps);
		return responseResult;
	}

}
