package com.moit.util;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor //default 기본생성자
public class UtilPaging {
	private int listtotal;  //#1) 전체글 193
	private int onepagelist;//#2) 한페이지에 보여줄 게시물의 수 10 
	private int pagetotal;  //#3) 총페이지 193/10 19페이지 + 3글 = 20개
	private int bottomlist; //#4) 하단페이지 수 10
	private int pstartno;   //#5) 페이지 시작번호 //oracle 버전 (1) 1,10 (2) 11,10 // - mysql 버전 (1) 0,10 (2) 10,10 
	private int current;    //#6) 현재번호
	private int start;		//#7) 시작번호
	private int end;		//#8) 끝번호
	
	public UtilPaging(int listtotal, int pageNo) {
		this(listtotal, pageNo, 10, 10); //한페이지10, 하단네비10
	}

	public UtilPaging(int listtotal, int pageNo, int onepagelist, int bottomlist) {
		this.listtotal = (listtotal <= 0) ? 1 : listtotal;
		this.onepagelist = onepagelist;
		this.pagetotal = (int) Math.ceil(this.listtotal / (double) onepagelist); // 19페이지 + 3글 = 20개
		// 193/10 -> 19.3 -> 올림 -> 20
		
		this.bottomlist = bottomlist;
		this.current = pageNo; // 23 -> start=21, end=30
		this.start = ((current - 1) / bottomlist) * bottomlist + 1;
		//21 -> (21-1)/10 -> 앞자리를 2로 *10 + 1
		//30 -> (30-1)/10 -> 앞자리를 2로 *10 + 1 
		this.end = start + bottomlist - 1;//21+10-1 = 30
		if (end > pagetotal) {
			end = pagetotal; // 30>26 마지막은 26으로
		}

		this.pstartno = (pageNo - 1) * onepagelist + 1;
	}
}
