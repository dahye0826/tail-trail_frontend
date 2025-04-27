# 장소 평균 별점 구현 가이드

## 1. 백엔드 구현 파일

### VisitedPlacesRepository.java
```java
// 추가 필요한 메서드:
// place_id별 평균 별점을 계산하는 쿼리 메서드
@Query("SELECT v.place.placeId, AVG(v.rating) as avgRating " +
       "FROM VisitedPlaces v " +
       "GROUP BY v.place.placeId")
List<Object[]> calculateAverageRatingByPlaceId();
```

### VisitedPlacesService.java
```java
// 현재 구현된 관련 메서드:
// 1. 방문 기록 생성 (별점 포함)
public void createVisitedPlace(VisitedPlacesRequestDto dto)

// 2. 방문 기록 수정 (별점 수정)
public VisitedPlacesResponseDto updateVisitedPlace(Long visitId, VisitedPlacesRequestDto requestDto)

// 추가 필요한 메서드:
// place_id별 평균 별점을 조회하는 메서드
public Map<Long, Double> getAverageRatingsByPlaceId()
```

### VisitedPlacesController.java
```java
// 추가 필요한 엔드포인트:
// place_id별 평균 별점을 반환하는 API
@GetMapping("/places/average-ratings")
public ResponseEntity<Map<Long, Double>> getAverageRatings()
```

## 2. 프론트엔드 구현 파일

### PlaceDetailPage.js
```javascript
// 현재 구현된 관련 부분:
// 1. 개별 별점 표시 함수
const renderStars = (rating) => {
  // ... 기존 코드 ...
}

// 2. 리뷰 폼의 별점 입력 부분
const renderReviewForm = () => (
  <form>
    <select value={newReview.rating}>
      {[5, 4, 3, 2, 1].map((rating) => (
        <option key={rating} value={rating}>
          {rating}점
        </option>
      ))}
    </select>
  </form>
)

// 추가 필요한 부분:
// 1. 평균 별점을 가져오는 API 호출
const [averageRating, setAverageRating] = useState(0);

// 2. 평균 별점 표시 컴포넌트
const renderAverageRating = () => {
  // 구현 필요
}
```

### PlaceDetailPage.css
```css
// 현재 구현된 관련 스타일:
.rating-stars .star {
  color: #FFD700;
  font-size: 1.2rem;
  margin-right: 2px;
}

// 추가 필요한 스타일:
.average-rating {
  // 구현 필요
}
```

## 3. 데이터베이스 구조

### visited_places 테이블
```sql
-- 관련 필드:
visit_id (PK)
place_id (FK)
rating (Integer) -- 1-5 사이의 별점 값
```

## 4. 구현 순서

1. 백엔드:
   - VisitedPlacesRepository에 평균 계산 쿼리 추가
   - VisitedPlacesService에 평균 조회 메서드 추가
   - Controller에 새 엔드포인트 추가

2. 프론트엔드:
   - API 호출 함수 구현
   - 평균 별점 표시 컴포넌트 구현
   - CSS 스타일링 추가

3. 테스트:
   - 백엔드 API 테스트
   - 프론트엔드 동작 확인
   - 전체 기능 테스트 