package com.moit.common.service;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.moit.common.dto.AddressSearchResponse;
import com.moit.common.dto.SolapiSmsDto.SolapiSmsRequestDto;
import com.moit.common.dto.SolapiSmsDto.SolapiSmsResponseDto;
import com.moit.common.dto.WeatherInfoRequest;
import com.moit.common.dto.WeatherInfoResponse;
import com.moit.util.GridUtil;
import com.solapi.sdk.SolapiClient;
import com.solapi.sdk.message.exception.SolapiEmptyResponseException;
import com.solapi.sdk.message.exception.SolapiMessageNotReceivedException;
import com.solapi.sdk.message.exception.SolapiUnknownException;
import com.solapi.sdk.message.model.Message;
import com.solapi.sdk.message.service.DefaultMessageService;

@Service
public class OpenApiServiceImpl implements OpenApiService {

    @Value("${kma.api.key}")
    private String kmaApiKey;
    @Value("${vworld.api.key}")
    private String apiKey;
    
    @Value("${solapi.api-key}")
    private String solapiApiKey;
    @Value("${solapi.api-secret}")
    private String solapiApiSecret;
    @Value("${solapi.sender}")
    private String sender;

    private final RestClient vworldRestClient;
    private final RestClient weatherRestClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OpenApiServiceImpl(
            @Qualifier("vworldRestClient") RestClient vworldRestClient,
            @Qualifier("weatherRestClient") RestClient weatherRestClient
    		) {
        this.vworldRestClient = vworldRestClient;
        this.weatherRestClient = weatherRestClient;
    }
    
	@Override
	public WeatherInfoResponse getWeathreInfo(WeatherInfoRequest request) {
//		0200(3시~5시), 0500(6시~8시), 0800(9시~11시), 1100(12시~14시), 1400(15시~17시), 1700(18시~20시), 2000(21시~23시), 2300(24시~02시)
		/*
		 * LocalTime now = LocalTime.now(); LocalDate date = LocalDate.now();
		 * DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH"); Integer
		 * formattedNow = Integer.parseInt(now.format(formatter));
		 * 
		 * DateTimeFormatter formatterYYYYMMDD =
		 * DateTimeFormatter.ofPattern("yyyyMMdd"); String baseDate =
		 * date.format(formatterYYYYMMDD);
		 * 
		 * String baseTime = switch (formattedNow) { case 0, 1, 2 -> "2300"; case 3, 4,
		 * 5 -> "0200"; case 6, 7, 8 -> "0500"; case 9, 10, 11 -> "0800"; case 12, 13,
		 * 14 -> "1100"; case 15, 16, 17 -> "1400"; case 18, 19, 20 -> "1700"; case 21,
		 * 22, 23 -> "2000"; default -> throw new
		 * IllegalStateException("Unexpected value: " + formattedNow); };
		 */
		LocalTime now = LocalTime.now();
		LocalDate date = LocalDate.now();

		DateTimeFormatter formatter =
		        DateTimeFormatter.ofPattern("HH");

		int formattedNow =
		        Integer.parseInt(now.format(formatter));

		DateTimeFormatter formatterYYYYMMDD =
		        DateTimeFormatter.ofPattern("yyyyMMdd");

		String baseTime;

		if (formattedNow >= 0 && formattedNow <= 2) {

		    // 자정~새벽 2시는 오늘 23시 데이터가 아직 없으므로
		    // 전날 23시 발표 데이터를 사용한다.
		    date = date.minusDays(1);
		    baseTime = "2300";

		} else {

		    baseTime = switch (formattedNow) {
		        case 3, 4, 5 -> "0200";
		        case 6, 7, 8 -> "0500";
		        case 9, 10, 11 -> "0800";
		        case 12, 13, 14 -> "1100";
		        case 15, 16, 17 -> "1400";
		        case 18, 19, 20 -> "1700";
		        case 21, 22, 23 -> "2000";
		        default -> throw new IllegalStateException(
		            "Unexpected value: " + formattedNow
		        );
		    };
		}

		String baseDate =
		        date.format(formatterYYYYMMDD);

		System.out.println("현재 시간 = " + now);
		System.out.println("날씨 기준 날짜 = " + baseDate);
		System.out.println("날씨 기준 시간 = " + baseTime);
//		System.out.println(baseDate + "aaa"); System.out.println(formattedNow + "ddddd"); System.out.println(baseTime + "aafafs");
//		System.out.println(request.getNx());
//		System.out.println(request.getNy());
		System.out.println("/getVilageFcst?serviceKey="+kmaApiKey+"&numOfRows=1000&pageNo=1&base_date="+baseDate+"&base_time="+baseTime+"&nx="+request.getNx()+"&ny="+request.getNy());
		String xml  = weatherRestClient
				.get()
				.uri("/getVilageFcst?serviceKey="+kmaApiKey+"&numOfRows=1000&pageNo=1&base_date="+baseDate+"&base_time="+baseTime+"&nx="+request.getNx()+"&ny="+request.getNy())
				.retrieve()
		        .body(String.class); //날씨 데이터를 받아온다. 현재날짜, 현재시간, nx, ny기준으로 1000개
		
		XmlMapper xmlMapper = new XmlMapper(); // xml형식으로 변환
		WeatherInfoResponse result = new WeatherInfoResponse();
		try {
			JsonNode node = xmlMapper.readTree(xml.getBytes()); //xml -> json형식으로 변환
			
			Map<String, Object> response = objectMapper.convertValue( // 변환된 json형식의 데이터를  map 형식으로 변환
			        node,
			        new TypeReference<Map<String, Object>>() {}
			);
			//System.out.println(response);
			Map<String, Object> body = (Map<String, Object>) response.get("body"); // map -> response 에서 body꺼내오기
			//System.out.println(body);
			Map<String, Object> items = (Map<String, Object>) body.get("items"); // map -> items 에서 item 꺼내오기
			//System.out.println(items);
			List<Map<String, Object>> itemList = 
			        (List<Map<String, Object>>) items.get("item");
			List<Map<String, Object>> filteredItemList = itemList.stream().filter(item->{
				String fcstDate = (String)item.get("fcstDate");
				String fcstTime = (String)item.get("fcstTime");
				//System.out.println(fcstTime);
				//System.out.println(request.getMeetupTime()+ "00");
;
				String meetupTime = String.format("%02d00", request.getMeetupTime());
				//System.out.println("🔥 찾는 예보시간 = " + meetupTime);

				//System.out.println("🔥 itemList size = " + itemList.size());
				return fcstDate.equals(request.getMeetupDate()) && fcstTime.equals(meetupTime);
			}).toList();
			
			/* <item>
			<baseDate>20260710</baseDate>
			<baseTime>0500</baseTime>
			<category>TMP</category>
			<fcstDate>20260710</fcstDate>
			<fcstTime>0600</fcstTime>
			<fcstValue>24</fcstValue>
			<nx>55</nx>
			<ny>127</ny>
			</item> 를 리스트로 받기*/ 

			for(Map<String, Object> item : filteredItemList ) { //아이템에서 값 뽑아오기
				String category = (String)item.get("category");				
				String fcstValue = (String)item.get("fcstValue");
//				String fcstDate = (String)item.get("fcstDate");
//				String fcstTime = (String)item.get("fcstTime");
//				System.out.println(fcstDate);
//				System.out.println(fcstTime);
				if(category.equals("TMP")) {
					result.setTmp(Double.parseDouble(fcstValue));
				}else if(category.equals("POP")) {
					result.setPop(Integer.parseInt(fcstValue));
				}else if(category.equals("SKY")) {
					String skyString = switch(Integer.parseInt(fcstValue)) {
					case 0,1,2,3,4,5 -> "맑음";
					case 6,7,8 -> "구름많음";
					case 9,10 -> "흐림";
					 default -> throw new IllegalStateException("Unexpected value: " + formattedNow);
					};
					result.setSky(skyString);
				}
			}
			
			
		} catch (IOException e) {
			e.printStackTrace();
		}
	
		 return result;
		
	}

	@Override
    public AddressSearchResponse.AddressSearchListResponseDto addressSearch(String keyword, Pageable pageable) {
	    int page = pageable.getPageNumber() + 1;
	    int size = pageable.getPageSize();
	    
        String json = vworldRestClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/req/search")
                        .queryParam("service", "search")
                        .queryParam("request", "search")
                        .queryParam("version", "2.0")
                        .queryParam("crs", "EPSG:4326")
                        .queryParam("size", size)
                        .queryParam("page", page)
                        .queryParam("type", "ADDRESS")
                        .queryParam("category", "ROAD")
                        .queryParam("format", "json")
                        .queryParam("errorformat", "json")
                        .queryParam("key", apiKey)
                        .queryParam("query", keyword)
                        .build())
                .retrieve()
                .body(String.class);

        try {

            JsonNode root = objectMapper.readTree(json);

            JsonNode items = root.path("response")
                                 .path("result")
                                 .path("items");
            
            JsonNode pageInfo = root.path("response")
                    .path("page");

            List<AddressSearchResponse.AddressSearchDto> list = new ArrayList<>();

            for (JsonNode item : items) {

            	AddressSearchResponse.AddressSearchDto dto = new AddressSearchResponse.AddressSearchDto();

                dto.setAddress(item.path("address").path("road").asText());
                dto.setRoad(item.path("address").path("road").asText());
                dto.setJibun(item.path("address").path("parcel").asText());
                dto.setZipNo(item.path("address").path("zipcode").asText());
                dto.setLongitude(item.path("point").path("x").asDouble());
                dto.setLatitude(item.path("point").path("y").asDouble());               
                String[] addr = dto.getRoad().split(" ");

                dto.setSido(addr[0]);
                dto.setSigungu(addr[1]);
                GridUtil.Grid grid = GridUtil.convert(dto.getLatitude(), dto.getLongitude());
                dto.setNx(grid.nx());
                dto.setNy(grid.ny());

                list.add(dto);
            }
            
            AddressSearchResponse.AddressSearchListResponseDto response = new AddressSearchResponse.AddressSearchListResponseDto();
            
            // 목록
            response.setList(list);

            // 전체 데이터 개수
            long totalCount = pageInfo.path("total").asLong();
            
            response.setTotalCount(totalCount);

            // 전체 페이지 수
            long totalPage = (long) Math.ceil((double) totalCount / size);

            response.setTotalPage(totalPage);
            
            return response;

        } catch (Exception e) {
            throw new RuntimeException(e);
        }

    }

	@Override
	public SolapiSmsResponseDto sendSms(SolapiSmsRequestDto request) {
		DefaultMessageService  messageService = 
				SolapiClient.INSTANCE.createInstance(solapiApiKey, solapiApiSecret);
		
		Message message = new Message();
		
		message.setFrom(sender);
		message.setTo(request.getPhoneNumber());
		message.setText(request.getMessage());
		
		try {
		    messageService.send(message, null);

		    return new SolapiSmsResponseDto("SMS 발송 성공");

		} catch (
		    SolapiMessageNotReceivedException |
		    SolapiEmptyResponseException |
		    SolapiUnknownException e
		) {
		    e.printStackTrace();

		    return new SolapiSmsResponseDto("SMS 발송 실패" + e);
		}	
	}
	
	
}
