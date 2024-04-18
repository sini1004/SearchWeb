package com.example.searchWeb.util;

import com.list.ontobase.client.query.SparqlQuery;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.sparql.resultset.SPARQLResult;
import org.apache.poi.ss.usermodel.*;

import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

/**
 * LOD 로부터 메타데이터 정보를 찾아 EADL 엑셀 문서를 채워주는 클래스<BR>
 * 
 * @author hyuk kang
 */
public class AuthorFinderTest {
	/**
	 * SparqlQuery
	 */
	private SparqlQuery sq;

	/**
	 * 생성자
	 * 
	 * @param ip          Ontobase 아이피
	 * @param port        Ontobase 포트
	 * @param serviceName Ontobase 서비스
	 */
	public AuthorFinderTest(String ip, int port, String serviceName) {
		sq = new SparqlQuery(ip, port, serviceName);
	}

	/**
	 * 쿼리 결과를 생성해서 리턴
	 * 
	 * @param fw       FileWriter
	 * @param resource 리소스
	 */
	public void execQuerySelect(FileWriter fw, String resource) {
		try {
			String query = "prefix foaf: <http://xmlns.com/foaf/0.1/> ";
			query += "select ?s ?p ?o where { ?s foaf:name \"" + resource + "\" . ?s ?p ?o }";

			SPARQLResult result = sq.execute(query);

			if (result == null) {
				throw new Exception("Error: SPARQLResult is null");
			}

			ResultSet rs = result.getResultSet();
			while (rs.hasNext()) {
				QuerySolution rb = rs.nextSolution();
				String s = rb.get("?s").toString();
				String p = rb.get("?p").toString();
				String o = rb.get("?o").toString();

				String line = s + "\t" + p + "\t" + o + "\n";
				fw.write(line);
				fw.flush();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/**
	 * 파일을 읽어 메타데이터 내용을 스파클 엔드포인트에서 찾아 채워준다.
	 * 
	 * @param input  제어번호 파일
	 * @param output 파일
	 */
	private void writeFromClient(String input, String output) {
		Set<String> set = new HashSet<String>();

		Workbook wb = null;
		InputStream inp = null;
		try {
			wb = WorkbookFactory.create(new FileInputStream(input));

			Sheet sheet = wb.getSheetAt(0);

			// read
			int skipRow = 1;
			int count = 0;
			for (Row row : sheet) {
				count++;
				if (count > skipRow) {
					Cell cell_name = row.getCell(0);
					String name = cell_name.getStringCellValue();
					if (name == null || name.isEmpty())
						continue;

					set.add(name.trim());
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if (inp != null) {
				try {
					inp.close();
				} catch (IOException e) {// ignore
				}
			}

			if (wb != null) {
				try {
					wb.close();
				} catch (IOException e) { // ignore
				}
			}
		}

		System.out.println("set=" + set);
		System.out.println("set.size()=" + set.size());

		FileWriter fw = null;
		try {
			fw = new FileWriter(output);

			Iterator<String> iter = set.iterator();
			while (iter.hasNext()) {
				String n = iter.next();

				execQuerySelect(fw, n);
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if (fw != null) {
				try {
					fw.close();
				} catch (IOException e) {
				}
			}
		}
	}

	/**
	 * close
	 */
	private void close() {
		if (sq != null) {
			try {
				sq.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}

	public static void main(String[] args) {
		String path = "./sample/";
		String input = path + "저자명_중복_상위60.xlsx";
		String output = "./sample/Author.txt";

		String ip = "172.16.0.192";
		int port = 9999;
		String serviceName = "nlk";

		System.out.println("start...");
		AuthorFinderTest test = new AuthorFinderTest(ip, port, serviceName);
		test.writeFromClient(input, output);
		test.close();
		System.out.println("finish...");
	}
}
