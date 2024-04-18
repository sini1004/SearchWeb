package com.example.searchWeb.util;

import java.io.BufferedReader;
import java.io.FileReader;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 * author 의 동명이인 통계 추출
 * 
 * @author ProDesk
 */
public class NlkAuthorSameNameTest {
	private static void createAuthorMap(String file) throws Exception {
		Map<String, Integer> nameMap = new HashMap<String, Integer>();

		BufferedReader br = null;
		try {
			br = new BufferedReader(new FileReader(file));
			String line = null;
			String ps = "";
			String pname = "";
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
				}

				if (ps.equals(s) == false) {
					if (nameMap.containsKey(pname)) {
						int v = nameMap.get(pname) + 1;
						nameMap.put(ps, v);
					} else {
						nameMap.put(pname, 1);
					}

					ps = s;
					pname = "";
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

		System.out.println("nameMap.size=" + nameMap.size());

		int total = 0;
		Iterator<String> iter = nameMap.keySet().iterator();
		while (iter.hasNext()) {
			String n = iter.next();
			int v = nameMap.get(n);
			total += v;
		}
		System.out.println("nameMap.size total=" + total);
	}

	public static void main(String[] args) throws Exception {
		String file = "D:\\sohohuk\\work\\eclipse\\workspace\\list-ontobase\\OntoBase\\testdoc\\Author_top60.txt";

		long start = System.currentTimeMillis();

		createAuthorMap(file);

		long end = System.currentTimeMillis();
		System.out.println(">>> Response Time: " + (end - start) / 10.0 + " ms");
	}

}
