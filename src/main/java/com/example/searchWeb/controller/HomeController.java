package com.example.searchWeb.controller;

import java.io.IOException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;
import org.thymeleaf.expression.Arrays;

import com.example.searchWeb.service.DbService;
import com.example.searchWeb.service.DuplicatedSearchService;
import com.example.searchWeb.service.SearchService;
import com.mysql.jdbc.StringUtils;

@Controller
public class HomeController {
    @Autowired
    private DuplicatedSearchService service;

    @Autowired
    private SearchService searchService;
    
    @Autowired
    private DbService dbService;

    @RequestMapping(value="/")
    public RedirectView index(){
        return new RedirectView("search");
    }

    @ResponseBody
    @PostMapping("/test")
    public Map<String, Object> test(@RequestBody String input) throws Exception {
        System.out.println("input: " + input);
        return service.run(input);
    }

    @ResponseBody
    @PostMapping("/sparql")
    public String sparql(@RequestParam String input) throws Exception {
        System.out.println("input: " + input);
        return searchService.search(input);
    }

    @RequestMapping(value="/duplicatedSearch")
    public String duplicatedSearch(){
        return "duplicatedSearch";
    }

	
	/*
	 * @RequestMapping(value="/duplicatedSearch2") public String
	 * duplicatedSearch2(){ //Dropdown Menu
	 * System.out.println(dbService.author035_Agency()); //Dropdown Menu에서 기관 선택후 중복
	 * //데이터 출력 System.out.println(dbService.author035_duplication("KOMCA")); return
	 * "duplicatedSearch2"; }
	 */

	
	
	@RequestMapping(value = "/duplicatedSearch2")
	public String duplicatedSearch2(Model model) {
		// Dropdown Menu
//		System.out.println(dbService.author035_Agency());
		// Dropdown Menu에서 기관 선택후 중복
		// 데이터 출력 System.out.println(dbService.author035_duplication("KOMCA"));
		model.addAttribute("agencyList", dbService.author035_Agency());
//		System.out.println(dbService.author035_duplication("KOMCA"));
		return "duplicatedSearch2";
	}

	@RequestMapping(value = "ajaxSearch", method = { RequestMethod.POST })
	public String ajaxSearch(@RequestParam("agency") String agency , Model model) {
		System.out.println("agency==>"+agency);
		// Dropdown Menu에서 기관 선택후 중복
//		model.addAttribute("agencyList", dbService.author035_Agency());
		model.addAttribute("agencyData", dbService.author035_duplication(agency));
		return "AjaxSearch";
	}


    @RequestMapping(value="/search")
    public String search(){
        return "search";
    }
    
    @RequestMapping(value="/search2")
    public String search2(){
        return "search2";
    }
    
    @ResponseBody
    @RequestMapping(value="/parser") 
    public HashMap<String, String> parser(@RequestParam(name="input") String input) throws Exception {
        System.out.println("parser: " + input );
        HashMap<String, String> returnMap = new HashMap<String, String>();        
        try {
        	Document doc = Jsoup.connect("https://id.loc.gov/search/?q=cs:http://id.loc.gov/authorities/names&q="+input).get();
        	
        	Elements table = doc.select(".tbody-group");
        	System.out.println("table : "+table.toString());
        	returnMap.put("table", table.toString());

    	} catch (IOException e) {   
    		e.printStackTrace();
    	}
        
        return returnMap;
    } 
    

}
