package com.example.searchWeb.util;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.util.*;

/**
 * author 의 유사성 검토 (author 생성은 eadl 소스 AuthorFinderTest 참조)
 * 
 * @author ProDesk
 */
public class NlkAuthorSimilarityTest {
	public static Map<String, Map<String, NlkAuthor>> createAuthorMap(String file) throws Exception {
		Map<String, Map<String, NlkAuthor>> nameMap = new HashMap<String, Map<String, NlkAuthor>>();

		BufferedReader br = null;
		try {
			br = new BufferedReader(new FileReader(file));
			String line = null;
			String ps = "";
			String pname = "";
			Map<String, List<String>> props = null;
			while ((line = br.readLine()) != null) {
				String[] split = line.split("\t");
				if (split == null || split.length != 3) {
					continue;
				}

				String s = split[0];
				String p = split[1];
				String o = split[2];

				if (ps.isEmpty()) {
					ps = s;
					props = new HashMap<String, List<String>>();
				}

				if (ps.equals(s) == false) {
					NlkAuthor obj = new NlkAuthor();
					obj.url = ps;
					obj.props = props;

					if (nameMap.containsKey(pname)) {
						Map<String, NlkAuthor> map = nameMap.get(pname);
						map.put(ps, obj);
					} else {
						Map<String, NlkAuthor> map = new HashMap<String, NlkAuthor>();
						map.put(ps, obj);
						nameMap.put(pname, map);
					}

					ps = s;
					pname = "";
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

				if (p.equals("http://xmlns.com/foaf/0.1/name")) {
					pname = o;
				}
			}
		} finally {
			if (br != null) {
				br.close();
			}
		}

		return nameMap;
	}

	private static void compare(Map<String, Map<String, Integer>> result, Map<String, NlkAuthor> map, String url,
			NlkAuthor author, String p) {
		List<String> props = author.props.get(p);

		Iterator<String> iter = map.keySet().iterator();
		while (iter.hasNext()) {
			String n = iter.next();
			if (url.equals(n)) {// 같은 대상 스킵
				continue;
			}
			NlkAuthor value = map.get(n);

			int count = 0;
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

	public static void main(String[] args) throws Exception {
		String file = "./sample/Author_top60.txt";

		String output = "./sample/output_author_top.txt";
		long start = System.currentTimeMillis();

		FileWriter fw = null;
		try {
			fw = new FileWriter(output);

			Map<String, Map<String, NlkAuthor>> nameMap = createAuthorMap(file);
			System.out.println("\t" + "nameMap: " + nameMap.size());

			Iterator<String> iter = nameMap.keySet().iterator();
			while (iter.hasNext()) {
				String name = iter.next();// name
				Map<String, NlkAuthor> map = nameMap.get(name);

				Map<String, Map<String, Integer>> result = new HashMap<String, Map<String, Integer>>();

				Iterator<String> it = map.keySet().iterator();
				while (it.hasNext()) {
					String url = it.next();
					NlkAuthor author = map.get(url);

					compare(result, map, url, author, "http://lod.nl.go.kr/ontology/fieldOfActivity");
					compare(result, map, url, author, "http://lod.nl.go.kr/ontology/create");
					compare(result, map, url, author, "http://lod.nl.go.kr/ontology/birthYear");
					compare(result, map, url, author, "http://lod.nl.go.kr/ontology/deathYear");
					compare(result, map, url, author, "http://purl.org/dc/elements/1.1/source");
				}

				//가장 총합이 많은 것을 찾는 부분
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
				for (Map.Entry<String, Integer> entry : entryList) {
					String key = entry.getKey();
					int total = entry.getValue();

					// 개수 체크
					if (total == 0)
						continue;

					if (total < top)// 최대 개수만 출력
						continue;

					String[] keys = key.split("_");

					// 중복 체크
					String newkey = keys[1] + "_" + keys[0];
					if (writeSet.contains(newkey))
						continue;

					writeSet.add(key);
					writeSet.add(newkey);

					// 한국연구자정보 체크
					NlkAuthor author_0 = map.get(keys[0]);
					NlkAuthor author_1 = map.get(keys[1]);
					List<String> o_0 = author_0.props.get("http://purl.org/dc/elements/1.1/source");
					List<String> o_1 = author_1.props.get("http://purl.org/dc/elements/1.1/source");
					boolean find = false;
					for (String s_0 : o_0) {
						if (s_0.equals("한국연구자정보(KRI) https://www.kri.go.kr")) {
							for (String s_1 : o_1) {
								if (s_1.equals("한국연구자정보(KRI) https://www.kri.go.kr")) {
									find = true;
									break;
								}
							}
						}
					}
					if (find)
						continue;

					Map<String, Integer> detail = result.get(key);
					int count_1 = detail.get("http://lod.nl.go.kr/ontology/fieldOfActivity");
					int count_2 = detail.get("http://lod.nl.go.kr/ontology/create");
					int count_3 = detail.get("http://lod.nl.go.kr/ontology/birthYear");
					int count_4 = detail.get("http://lod.nl.go.kr/ontology/deathYear");
					int count_5 = detail.get("http://purl.org/dc/elements/1.1/source");
					fw.write(name + "\t" + keys[0] + "\t" + keys[1] + "\t" + total + "\t" + count_1 + "\t" + count_2
							+ "\t" + count_3 + "\t" + count_4 + "\t" + count_5 + "\n");
				}
			}
		} finally {
			if (fw != null) {
				fw.close();
			}
		}

		long end = System.currentTimeMillis();
		System.out.println(">>> Response Time: " + (end - start) / 10.0 + " ms");
	}

}
