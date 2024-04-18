package com.example.searchWeb.db;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MySqlQueryData {

	/**
	  * @Method Name : author035_Agency
	  * @작성일 : 2023. 9. 4.
	  * @작성자 : YG
	  * @변경이력 : 
	  * @Method 설명 : MariaDB author035_Agency 테이블에서  Aegncy 컬럼 목록 추출 함수
	  * @return
	  * @throws SQLException
	 **/
	public ArrayList<String> author035_Agency() throws SQLException {
		MySQLConnection msc = new MySQLConnection();
		ArrayList<String> list = new ArrayList<>();
		Connection conn = null;
		String sql = "SELECT Agency FROM author035_Agency ";
		// Statement 생성 후 실행할 쿼리정보 등록
		Statement stmt = null;
		ResultSet rs = null;
		PreparedStatement ps = null;
		try {
			conn = msc.getMySQLConnection();
			ps = conn.prepareStatement(sql);
			rs = ps.executeQuery();
			while (rs.next()) {
				String Agency = rs.getString("Agency");
				list.add(Agency);
			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} finally {
			if (rs != null)
				rs.close();
			if (stmt != null)
				stmt.close();
			if (conn != null)
				conn.close();
		}
		return list;
	}
	
	/**
	  * @Method Name : author035_duplication
	  * @작성일 : 2023. 9. 5.
	  * @작성자 : YG
	  * @변경이력 : 
	  * @Method 설명 : 중복 데이터 추출
	  * @param agency
	  * @return
	  * @throws SQLException
	 **/
	public Map<String, Map<String,String>> author035_duplication(String agency) throws SQLException {
		MySQLConnection msc = new MySQLConnection();
		Connection conn = null;
		
		Map<String, Map<String,String>> map = new HashMap<>();
		
		String sql = "SELECT authorNumber, cntNumber  FROM author035_duplication where Agency= ? ";
		// Statement 생성 후 실행할 쿼리정보 등록
		Statement stmt = null;
		ResultSet rs = null;
		PreparedStatement ps = null;
		try {
			conn = msc.getMySQLConnection();
			ps = conn.prepareStatement(sql);
			ps.setString(1, agency);
			rs = ps.executeQuery();
			while (rs.next()) {
				String Agency = rs.getString("authorNumber");
				String cntNumber = rs.getString("cntNumber");
				map.put(Agency, cntData(cntNumber));
			}
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} finally {
			if (rs != null)
				rs.close();
			if (stmt != null)
				stmt.close();
			if (conn != null)
				conn.close();
		}
		return map;
	}
	
	/**
	  * @Method Name : cntData
	  * @작성일 : 2023. 9. 5.
	  * @작성자 : YG
	  * @변경이력 : 
	  * @Method 설명 : 한 컬럼에 여러 데이터를 [@], [:] 구분자를 활용하여 데이터를 insert 한 데이터를 불러와 쪼개는 작업
	  * @param text
	  * @return
	 **/
	public Map<String,String> cntData(String text) {
		Map<String,String> map = new HashMap<>();
		
		String[] texts = text.split("@");
		String name = "";
		String cnt = "";
		for(int i =0; i<texts.length; i++) {
			map.put(texts[i].split(":")[0], texts[i].split(":")[1]);
		}
		return map;
	}
}
