package com.example.searchWeb.util;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * hasFormat 관계의 offline online 데이터 통계 추출
 * 
 * @author ProDesk
 */
public class NlkHasFormatTest {
	private static Map<String, List<Integer>> createCreatorCntMap(String file) throws Exception {
		Map<String, List<Integer>> map = new HashMap<String, List<Integer>>();

		BufferedReader br = null;
		try {
			br = new BufferedReader(new FileReader(file));
			String line = null;
			String ps = "";
			int dc_cnt = 0;
			int dcterms_cnt = 0;
			while ((line = br.readLine()) != null) {
				String[] split = line.split("\t");
				if (split == null || split.length != 3) {
					continue;
				}

				String s = split[0];
				String p = split[1];

				if (ps.isEmpty()) {
					ps = s;
				}

				if (ps.equals(s) == false) {
					List<Integer> list = new ArrayList<Integer>(2);
					list.add(dc_cnt);
					list.add(dcterms_cnt);
					map.put(ps, list);
					ps = s;
					dc_cnt = 0;
					dcterms_cnt = 0;
				}

				if (p.equals("http://purl.org/dc/elements/1.1/creator")) {
					dc_cnt++;
				}
				if (p.equals("http://purl.org/dc/terms/creator")) {
					dcterms_cnt++;
				}
			}
		} finally {
			if (br != null) {
				br.close();
			}
		}

		return map;
	}

	public static void main(String[] args) throws Exception {
		String file_off = "./sample/OfflineMaterial.txt";
		String file_on = "./sample/OnlineMaterial.txt";

		String output = "./sample/output_hasformat.txt";
		long start = System.currentTimeMillis();

		FileWriter fw = null;
		BufferedReader br_off = null;
		try {
			br_off = new BufferedReader(new FileReader(file_off));
			fw = new FileWriter(output);

			Map<String, List<Integer>> map_off = createCreatorCntMap(file_off);
			System.out.println("\t" + "map_off: " + map_off.size());

			Map<String, List<Integer>> map_on = createCreatorCntMap(file_on);
			System.out.println("\t" + "map_on: " + map_on.size());

			// read offline
			String line = null;
			int count_1 = 0;
			int count_2 = 0;
			int count_3_off = 0;
			int count_3_on = 0;
			while ((line = br_off.readLine()) != null) {
				String[] split = line.split("\t");
				if (split == null || split.length != 3) {
					continue;
				}

				String s = split[0];
				String p = split[1];
				String o = split[2];

				if (o == null) {
					continue;
				}

				if (p.equals("http://purl.org/dc/terms/hasFormat")) {// hasFormat 관계
					if (o.startsWith("http://lod.nl.go.kr/resource/CNTS-")) {
						count_1++;

						if (map_off.containsKey(s) && map_on.containsKey(o)) {
							List<Integer> count_off = map_off.get(s);// offline
							List<Integer> count_on = map_on.get(o);// online
							if (count_off.get(1) != count_on.get(1)) {// 크기가 다른 경우
								fw.write(s + "\t" + o + "\t" + count_off.get(1) + "\t" + count_off.get(0) + "\t"
										+ count_on.get(1) + "\t" + count_on.get(0) + "\n");// write
								count_2++;
								count_3_off += count_off.get(1);
								count_3_on += count_on.get(1);
							}
						}
					}
				}
			}
			System.out.println("1. count: " + count_1);
			System.out.println("2. count: " + count_2);
			System.out.println("3. count(sum) off: " + count_3_off);
			System.out.println("3. count(sum) on: " + count_3_on);
		} finally {
			if (br_off != null) {
				br_off.close();
			}
			if (fw != null) {
				fw.close();
			}
		}

		long end = System.currentTimeMillis();
		System.out.println(">>> Response Time: " + (end - start) / 10.0 + " ms");
	}

}
