# 장소별 평균 별점 구현 가이드

## 1. 백엔드 구현

### 1.1 VisitedPlacesRepository.java
```java
// 1. 평균 별점 계산을 위한 쿼리 메서드 추가
@Query("SELECT v.place.placeId, AVG(v.rating) as avgRating " +
       "FROM VisitedPlaces v " +
       "GROUP BY v.place.placeId")
List<Object[]> calculateAverageRatingByPlaceId();

// 2. 특정 장소의 평균 별점 계산 쿼리
@Query("SELECT AVG(v.rating) FROM VisitedPlaces v WHERE v.place.placeId = :placeId")
Double calculateAverageRatingForPlace(@Param("placeId") Long placeId);
```
- `@Query` 어노테이션으로 직접 JPQL 쿼리 작성
- `GROUP BY`를 사용하여 장소별 평균 계산
- 특정 장소의 평균은 WHERE 절로 필터링

### 1.2 VisitedPlacesService.java
```java
// 1. 모든 장소의 평균 별점 조회 메서드
public Map<Long, Double> getAverageRatingsByPlaceId() {
    List<Object[]> results = visitedPlacesRepository.calculateAverageRatingByPlaceId();
    Map<Long, Double> averageRatings = new HashMap<>();
    
    for (Object[] result : results) {
        Long placeId = (Long) result[0];
        Double avgRating = (Double) result[1];
        averageRatings.put(placeId, avgRating);
    }
    
    return averageRatings;
}

// 2. 특정 장소의 평균 별점 조회 메서드
public Double getAverageRatingForPlace(Long placeId) {
    Double avgRating = visitedPlacesRepository.calculateAverageRatingForPlace(placeId);
    return avgRating != null ? avgRating : 0.0;
}
```
- Repository의 쿼리 결과를 가공하여 사용하기 쉬운 형태로 변환
- null 체크로 안전한 값 반환

### 1.3 VisitedPlacesController.java
```java
// 1. 모든 장소의 평균 별점 조회 API
@GetMapping("/average-ratings")
public ResponseEntity<Map<Long, Double>> getAverageRatings() {
    Map<Long, Double> averageRatings = visitedPlacesService.getAverageRatingsByPlaceId();
    return ResponseEntity.ok(averageRatings);
}

// 2. 특정 장소의 평균 별점 조회 API
@GetMapping("/places/{placeId}/average-rating")
public ResponseEntity<Double> getAverageRatingForPlace(@PathVariable Long placeId) {
    Double averageRating = visitedPlacesService.getAverageRatingForPlace(placeId);
    return ResponseEntity.ok(averageRating);
}
```
- RESTful API 엔드포인트 제공
- 적절한 HTTP 메서드와 경로 설정

## 2. 프론트엔드 구현

### 2.1 PlaceDetailPage.js
```javascript
// 1. 평균 별점 상태 관리
const [averageRating, setAverageRating] = useState(0);

// 2. 평균 별점 조회 함수
const fetchAverageRating = useCallback(async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/visited-place/places/${id}/average-rating`);
        setAverageRating(response.data);
    } catch (error) {
        console.error('평균 별점 조회 실패:', error);
    }
}, [id]);

// 3. 컴포넌트 마운트 시 평균 별점 조회
useEffect(() => {
    fetchAverageRating();
}, [fetchAverageRating]);

// 4. 카테고리와 별점 표시 컴포넌트
const renderCategoryAndRating = () => (
    <div className="category-rating-container">
        <span className="category-badge">{place.category}</span>
        <div className="rating-display">
            {renderStars(averageRating)}
            <span className="rating-count">
                ({averageRating ? averageRating.toFixed(1) : '0.0'})
            </span>
        </div>
    </div>
);
```
- useState로 평균 별점 상태 관리
- useCallback으로 API 호출 함수 최적화
- useEffect로 컴포넌트 마운트 시 데이터 로드
- 별점과 카테고리를 함께 표시하는 UI 컴포넌트

### 2.2 PlaceDetailPage.css
```css
/* 카테고리와 별점 컨테이너 스타일 */
.category-rating-container {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    background-color: #f8f9fa;
    padding: 8px 12px;
    border-radius: 8px;
    display: inline-flex;
}

/* 카테고리 뱃지 스타일 */
.category-rating-container .category-badge {
    font-size: 0.9rem;
    padding: 4px 8px;
    background-color: var(--primary-color);
    color: white;
    border-radius: 4px;
    margin: 0;
}

/* 별점 표시 영역 스타일 */
.category-rating-container .rating-display {
    display: flex;
    align-items: center;
    gap: 4px;
}

/* 별점 숫자 스타일 */
.category-rating-container .rating-count {
    font-size: 0.9rem;
    color: #666;
    margin-left: 4px;
}

/* 별 아이콘 스타일 */
.category-rating-container i {
    color: #ffd700;
    font-size: 0.9rem;
}
```
- Flexbox를 사용한 레이아웃 구성
- 반응형 디자인을 위한 크기 단위 사용
- 일관된 스타일 변수 활용

## 3. 주요 포인트

1. **백엔드**
   - JPQL을 사용한 효율적인 데이터 집계
   - 계층별 책임 분리 (Repository, Service, Controller)
   - RESTful API 설계

2. **프론트엔드**
   - React Hooks를 활용한 상태 관리
   - 컴포넌트 최적화
   - 재사용 가능한 UI 컴포넌트 설계
   - 반응형 CSS 구현

3. **에러 처리**
   - 백엔드: null 체크와 예외 처리
   - 프론트엔드: API 호출 실패 처리

4. **성능 고려사항**
   - 백엔드: 효율적인 쿼리 작성
   - 프론트엔드: 불필요한 리렌더링 방지

## 4. 개선 가능한 부분

1. 캐싱 도입으로 성능 향상
2. 실시간 업데이트 구현
3. 페이지네이션 적용
4. 더 자세한 에러 처리와 사용자 피드백 