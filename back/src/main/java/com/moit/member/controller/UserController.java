//package com.moit.member.controller;
//
//import java.util.List;
//import java.util.Map;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.annotation.AuthenticationPrincipal;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import com.moit.security.CustomUserDetailsService;
//import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
//import org.springframework.stereotype.Controller;
//import org.springframework.ui.Model;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.ModelAttribute;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RequestParam;
//import org.springframework.web.bind.annotation.ResponseBody;
//import org.springframework.web.multipart.MultipartFile;
//import org.springframework.web.servlet.mvc.support.RedirectAttributes;
//
////import com.moit.meetup.service.MeetupService1;
//import com.moit.member.dto.UserDto;
//import com.moit.member.enums.PasswordChangeResultEnum;
//import com.moit.member.service.UserService;
//import com.moit.security.CustomUserDetails;
//import com.moit.security.PasswordLeakService;
//
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import jakarta.servlet.http.HttpSession;
//
//
//@Controller
//@RequestMapping("/user/member")
//public class UserController {
//
//	@Autowired UserService service;
//	@Autowired PasswordLeakService passwordLeakService;
//	//@Autowired MeetupService1 meetupService;
//	@Autowired CustomUserDetailsService customUserDetailsService;
//	
//	// 회원가입
//	@PreAuthorize("isAnonymous()")
//	@GetMapping("/join")
//	public String join() {  return "user/member/join"; }
//	
//	@PreAuthorize("isAnonymous()")
//	@PostMapping("/join")
//	public String join_post(UserDto dto, HttpServletRequest request, RedirectAttributes rttr) {  
//		
//		dto.setJoinIp(getClientIp(request));
//		
//		int result = service.insert(dto);
//		
//		if(result==1) {
//			rttr.addFlashAttribute("msg", "회원가입이 완료되었습니다.");
//			return "redirect:/user/member/login"; 
//		}
//		
//		// 실패 시 입력 값 유지
//		rttr.addFlashAttribute("dto",dto);
//		
//		if(result==0) {
//			rttr.addFlashAttribute("msg", "이미 사용중인 아이디입니다.");
//		}
//		else if(result==-1){
//			rttr.addFlashAttribute("msg", "이미 사용중인 닉네임입니다.");
//		}
//		else if(result==-2) {
//			rttr.addFlashAttribute("msg","유출된 비밀번호입니다. 다른 비밀번호를 입력해주세요.");
//
//			return "redirect:/user/member/join";
//		}
//		else if(result==-3) {
//		    rttr.addFlashAttribute( "msg", "이미 등록된 전화번호입니다."
//		    );
//		}
//		else {
//			rttr.addFlashAttribute("msg", "회원가입에 실패했습니다.");	
//		}
//		return "redirect:/user/member/join"; 
//	}
//	
//	// 아이디 중복검사
//	@ResponseBody
//	@GetMapping("/checkLoginId")
//	public Map<String, Boolean> checkLoginId(@RequestParam String loginId) {
//
//        UserDto dto = service.findUser(
//                Map.of("loginId", loginId));
//
//        return Map.of("exists", dto != null);
//    }
//	
//	// 닉네임 중복검사
//	@ResponseBody
//	@GetMapping("/checkNickname")
//	public Map<String, Boolean> checkNickname(@RequestParam String nickname) {
//
//        UserDto dto = service.findUser(
//                Map.of("nickname", nickname));
//
//        return Map.of("exists", dto != null);
//    }
//	
//	// 전화번호 중복검사
//	@ResponseBody
//	@GetMapping("/checkMobile")
//	public Map<String, Boolean> checkMobile(
//	        @RequestParam String mobile) {
//
//	    UserDto dto = service.findUser(
//	            Map.of("mobile", mobile)
//	    );
//
//	    return Map.of("exists", dto != null);
//	}
//	
//	// 로그인
//	@PreAuthorize("isAnonymous()")
//	@GetMapping("/login")
//	public String login() {  return "user/member/login"; }
//
//	
//	// 소셜 로그인
//	@GetMapping("/socialInfo")
//    public String socialInfoForm(HttpSession session, Model model) {
//		
//		UserDto socialUser = (UserDto) session.getAttribute("socialUser");
//		
//		if(socialUser == null) {
//			
//			return "redirect:/user/member/login";
//		}
//		
//		model.addAttribute("socialUser",socialUser);
//		
//        return "user/member/socialInfo";
//    }
//
//    @PostMapping("/socialInfo")
//    public String socialInfoSave(
//    		@ModelAttribute UserDto dto,
//            HttpSession session,
//            HttpServletRequest request,
//            HttpServletResponse response) {
//
//    	UserDto socialUser =
//                (UserDto) session.getAttribute("socialUser");
//        
//        if(socialUser == null) {
//        	return "redirect:/user/member/login";
//        }
//
//        dto.setEmail(socialUser.getEmail());
//        if(dto.getNickname()==null || dto.getNickname().isEmpty()){
//            dto.setNickname(dto.getNickname());
//        }
//        dto.setProvider(socialUser.getProvider());
//        dto.setProviderId(socialUser.getProviderId());
//        dto.setProfileUrl(socialUser.getProfileUrl());
//        
//        service.insertSocialInfo(dto);
//
//        session.removeAttribute("socialUser");
//
//        SecurityContextHolder.clearContext();
//
//        session.invalidate();
//
//        return "redirect:/user/member/login";
//    }
//	
//    // 마이페이지
//	@PreAuthorize("isAuthenticated()")
//	@GetMapping("/mypage") public String  mypage( Authentication   authentication , Model model  ) {  
//		CustomUserDetails principal =
//	            (CustomUserDetails) authentication.getPrincipal();
//
//	    // 로그인 아이디 추출
//	    String loginId = principal.getUsername();
//
//	    // DB 조회용 DTO
//	    UserDto searchDto = new UserDto();
//	    searchDto.setLoginId(loginId);
//
//	    // DB에서 최신 회원정보 조회
//	    UserDto user = service.findByLoginId(searchDto);
//
//	    model.addAttribute("dto", user);	    
//
//	    //model.addAttribute("meetupStats",  meetupService.selectMyPageStats(user.getMemberId()));
//	    
//	    List<String> interests = service.getInterestList(user.getMemberId());
//
//	    model.addAttribute("interests", interests);
//	    
//	    return "user/member/mypage"; 
//	}
//	
//	// 아이디 찾기
//	@PreAuthorize("isAnonymous()")
//	@GetMapping("/findId") public String findIdPage() { return "user/member/findId"; }
//	
//	@PreAuthorize("isAnonymous()")
//	@PostMapping("/findId")
//	public String findId(UserDto dto , Model model) {
//		UserDto user = service.findId(dto);
//		
//		model.addAttribute("user",user);
//		
//		return "user/member/findIdResult";
//	}
//	
//	// 비밀번호 찾기
//	@PreAuthorize("isAnonymous()")
//	@GetMapping("/findPassword") public String findPasswordPage() { return "user/member/findPassword"; }
//	
//	@PreAuthorize("isAnonymous()")
//	@PostMapping("/findPassword")
//	public String findPassword(UserDto dto, Model model,HttpSession session) {
//		
//		UserDto user = service.findPasswordUser(dto);
//		
//		if(user == null) { 
//			model.addAttribute("error","일치하는 회원이 없습니다.");
//			return "user/member/findPassword";
//		}
//		
//		session.setAttribute("findMemberId", user.getMemberId());
//		
//		return "user/member/changePassword";
//	}
//	
//	// 비밀번호 재발급
//	@PreAuthorize("isAnonymous()")
//	@PostMapping("/changePassword")
//	public String changePassword(UserDto dto, HttpSession session,
//	                             RedirectAttributes rttr) {
//		Long memberId = (Long)session.getAttribute("findMemberId");
//		
//		if(memberId == null) {
//			return "redirect:/user/member/findPassword";
//		}
//		
//		dto.setMemberId(memberId);
//		
//	    service.changePassword(dto);
//	    
//	    session.removeAttribute("findMemberId");
//
//	    rttr.addFlashAttribute("message", "비밀번호가 변경되었습니다.");
//
//	    return "redirect:/user/member/login";
//	}
//	
//	// 회원가입 시 IP 조회
//	private String getClientIp(HttpServletRequest request) {
//
//		 String ip = request.getHeader("X-Forwarded-For");
//	
//		    if (ip == null || ip.isEmpty()) {
//		        ip = request.getRemoteAddr();
//		    }	
//		    return ip;
//	}
//	
//	// 회원정보 수정
//	@GetMapping("/memberEdit")
//	public String memberEdit(Authentication authentication ,Model model) {
//		CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();
//		
//		UserDto dto = new UserDto();
//		dto.setLoginId(user.getUsername());
//		
//		dto = service.findByLoginId(dto);
//		
//		// 전체 관심사
//	    model.addAttribute( "interestList", service.getAllInterest() );
//
//
//	    // 선택된 관심사
//	    dto.setInterestIds( service.getInterestIds(dto.getMemberId()) );
//		
//		model.addAttribute("dto",dto);
//		
//		return "user/member/memberEdit";		
//	}
//	
//	@PostMapping("memberEdit")
//	public String memberEdit(UserDto dto,
//						     @RequestParam(value = "profileImage", required = false)
//							 MultipartFile profileImage,
//							 @RequestParam(value="interestIds", required=false)
//							 List<Integer> interestIds,
//							 Authentication authentication, 
//							 RedirectAttributes rttr) {
//		
//		CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();
//		
//		 dto.setMemberId( user.getAppUserId() );
//		 dto.setLoginId(user.getUsername());
//		 
//		 dto.setProfileImage(profileImage);
//		 
//		 UserDto loginUser = service.findByLoginId(dto);
//		 
//		 // 닉네임 중복검사
//		 if (!loginUser.getNickname().equals(dto.getNickname())) {
//
//		        UserDto check = service.findUser(
//		                Map.of("nickname", dto.getNickname()));
//
//		        if (check != null) {
//		            rttr.addFlashAttribute("msg", "이미 사용중인 닉네임입니다.");
//		            return "redirect:/user/member/memberEdit";
//		        }
//		    }		 
//
//		    int result = service.updateUser(dto);
//		    
//		    service.updateInterest( dto.getMemberId(), interestIds );
//
//		    if(result == 1){
//		    	CustomUserDetails newUser = (CustomUserDetails) customUserDetailsService.loadUserByUsername(dto.getLoginId());
//
//		        Authentication newAuthentication = new UsernamePasswordAuthenticationToken( newUser, authentication.getCredentials(), newUser.getAuthorities());
//		        
//		        SecurityContextHolder.getContext() .setAuthentication(newAuthentication);
//		        
//		        rttr.addFlashAttribute("msg","회원정보가 수정되었습니다.");
//		    }else{
//		        rttr.addFlashAttribute("msg","회원정보 수정에 실패했습니다.");
//		    }
//		
//		return "redirect:/user/member/mypage";
//	}
//	
//	// 비밀번호 변경(로그인한 유저)
//	@GetMapping("/passwordChange")
//	public String passwordChange(Model model,
//						         UserDto dto,
//						         Authentication authentication) { 
//		String loginId = authentication.getName();
//		dto.setLoginId(loginId);
//		UserDto userDto = service.findByLoginId(dto);
//		
//		model.addAttribute("dto", userDto);
//		
//		return "user/member/passwordChange"; 
//	}
//	
//	@PostMapping("/passwordChange")
//	public String passwordChage(@RequestParam String currentPassword, 
//								@RequestParam String newPassword,
//			                    Authentication authentication, 
//			                    RedirectAttributes rttr) {
//		CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();
//		
////		boolean result = service.changePassword(user.getAppUserId(),currentPassword,newPassword);
////		
////		if(!result) { 
////			rttr.addFlashAttribute("msg","현재 비밀번호가 일치하지 않습니다."); 
////			return "redirect:/user/member/passwordChange";
////		}
////		
////		rttr.addFlashAttribute("msg","비밀번호가 변경되었습니다.");
////		
////		return "redirect:/user/member/mypage";	
//		
//		PasswordChangeResultEnum result = service.changePassword( user.getAppUserId(), currentPassword, newPassword );
//
//		switch (result) {
//		    case SUCCESS:  rttr.addFlashAttribute( "msg", "비밀번호가 변경되었습니다." );
//		        return "redirect:/user/member/mypage";
//
//		    case WRONG_PASSWORD:  rttr.addFlashAttribute( "msg", "현재 비밀번호가 일치하지 않습니다." );
//		        return "redirect:/user/member/passwordChange";
//
//		    case LEAKED_PASSWORD:  rttr.addFlashAttribute( "msg", "유출된 비밀번호입니다. 다른 비밀번호를 사용해주세요." );
//		        return "redirect:/user/member/passwordChange";
//
//		    case API_ERROR:  rttr.addFlashAttribute( "msg", "비밀번호 보안 검사를 수행할 수 없습니다. 잠시 후 다시 시도해주세요." );
//		        return "redirect:/user/member/passwordChange";
//
//		    default: rttr.addFlashAttribute( "msg", "알 수 없는 오류가 발생했습니다." );
//		        return "redirect:/user/member/passwordChange";
//		}
//	}
//	
//	// 비밀번호 유출 검사
//	@ResponseBody
//	@GetMapping("checkPassword")
//	public Map<String,Object> checkPassword(@RequestParam String password){
//		int leakCount = passwordLeakService.getLeakCount(password);
//		
//		if(leakCount == -1) { return Map.of("safe",true , "count",0, "error",true); }
//		
//		return Map.of("safe", leakCount == 0, "count" , leakCount , "error" , false);
//	}
//	
//	// 회원탈퇴
//	@GetMapping("/memberDelete")
//	public String memberDeletePage(Authentication authentication, Model model) {
//		
//		CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();
//
//	    UserDto dto = new UserDto();
//	    dto.setLoginId(user.getUsername());
//
//	    dto = service.findByLoginId(dto);
//
//	    model.addAttribute("dto", dto);
//
//	    return "user/member/memberDelete";
//		}
//	
//	@PostMapping("/memberDelete")
//	public String memberDelete(@RequestParam String password,
//							   Authentication authentication,
//							   HttpServletRequest request,
//							   HttpServletResponse response,
//							   RedirectAttributes rttr) {
//		CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();
//		
//		boolean result = service.deleteMember(user.getAppUserId(), password);
//		
//		if(!result) {
//			rttr.addFlashAttribute("msg","비밀번호가 일치하지 않습니다.");
//			
//			return "redirect:/user/member/memberDelete";
//		}
//		
//		new SecurityContextLogoutHandler()
//			.logout(request, response, authentication);
//			
//		return "redirect:/user/member/login";	
//	}
//
//	@GetMapping("/kakaologout") 
//	public String kakaoLogout() {  return "redirect:/user/member/login";  }
//
//}
