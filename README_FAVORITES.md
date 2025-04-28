# 즐겨찾기 기능 구현 가이드

## 1. 백엔드 구조

### 1.1 데이터베이스 (favorites 테이블)
```sql
CREATE TABLE favorites (
    favorite_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    place_id BIGINT,
    added_date DATE
);
```

### 1.2 Entity (Favorites.java)
```java
@Entity
@Table(name = "favorites")
public class Favorites {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long favoriteId;
    private Long userId;
    private Long placeId;
    private LocalDate addedDate;
}
```

### 1.3 Repository (FavoritesRepository.java)
```java
@Repository
public interface FavoritesRepository extends JpaRepository<Favorites, Long> {
    // 사용자와 장소로 즐겨찾기 찾기
    Optional<Favorites> findByUserIdAndPlaceId(Long userId, Long placeId);
    
    // 필터링된 즐겨찾기 목록 조회
    Page<Favorites> findFavoritesWithFilters(Long userId, Long placeId, Pageable pageable);
}
```

### 1.4 Service (FavoritesService.java)
```java
@Service
public class FavoritesService {
    // 즐겨찾기 토글 (추가/제거)
    public boolean toggleFavorite(Long userId, Long placeId) {
        Optional<Favorites> existing = repository.findByUserIdAndPlaceId(userId, placeId);
        if (existing.isPresent()) {
            repository.delete(existing.get());
            return false; // 제거됨
        } else {
            Favorites favorite = new Favorites();
            favorite.setUserId(userId);
            favorite.setPlaceId(placeId);
            favorite.setAddedDate(LocalDate.now());
            repository.save(favorite);
            return true; // 추가됨
        }
    }

    // 즐겨찾기 목록 조회
    public Map<String, Object> getFavorites(Long userId, Long placeId, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Favorites> favoritesPage = repository.findFavoritesWithFilters(userId, placeId, pageable);
        return createResponse(favoritesPage);
    }
}
```

### 1.5 Controller (FavoritesController.java)
```java
@RestController
@RequestMapping("/api/favorites")
public class FavoritesController {
    // 즐겨찾기 목록 조회
    @GetMapping
    public ResponseEntity<?> getFavorites(
            @RequestParam Long userId,
            @RequestParam(required = false) Long placeId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size)

    // 즐겨찾기 토글
    @PostMapping("/toggle")
    public ResponseEntity<?> toggleFavorite(
            @RequestParam Long userId,
            @RequestParam Long placeId)
}
```

## 2. 프론트엔드 구현 (PlaceDetailPage.js)

### 2.1 상태 관리
```javascript
const [isLoggedIn, setIsLoggedIn] = useState(false)
const [isFavorite, setIsFavorite] = useState(false)
```

### 2.2 즐겨찾기 상태 체크
```javascript
const checkFavoriteStatus = useCallback(async () => {
    const userId = localStorage.getItem("userId")
    if (!userId) {
        setIsFavorite(false)
        return
    }
    
    try {
        const response = await axios.get(`${API_BASE_URL}/favorites`, {
            params: { 
                userId: Number(userId),
                placeId: Number(id),
                page: 1,
                size: 1
            }
        })
        
        const isFavorited = response.data.favorites && response.data.favorites.length > 0
        setIsFavorite(isFavorited)
    } catch (error) {
        console.error("즐겨찾기 상태 확인 실패:", error)
        setIsFavorite(false)
    }
}, [id])
```

### 2.3 즐겨찾기 토글 함수
```javascript
const toggleFavorite = async () => {
    if (!isLoggedIn) {
        alert("로그인이 필요한 서비스입니다.")
        navigate("/login")
        return
    }

    const userId = localStorage.getItem("userId")
    try {
        const response = await axios.post(`${API_BASE_URL}/favorites/toggle`, null, {
            params: {
                userId: Number(userId),
                placeId: Number(id)
            }
        })
        
        if (response.data.success) {
            setIsFavorite(response.data.isAdded)
            const message = response.data.isAdded ? 
                "즐겨찾기에 추가되었습니다." : 
                "즐겨찾기가 해제되었습니다."
            alert(message)
        }
    } catch (error) {
        console.error("즐겨찾기 처리 실패:", error)
        alert("즐겨찾기 처리 중 오류가 발생했습니다.")
    }
}
```

### 2.4 UI 구현
```javascript
const renderImageSection = () => (
    <div className="row mb-4">
        <div className="col">
            <div className="position-relative">
                <img
                    src={place.images[0] || "/placeholder.svg"}
                    alt={place.name}
                    className="img-fluid rounded shadow-sm"
                    onError={(e) => {e.target.src = "/placeholder.svg"}}
                />
                <button 
                    className={`btn-favorite ${isFavorite ? 'active' : ''}`}
                    onClick={toggleFavorite}
                    aria-label={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                >
                    <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                </button>
            </div>
        </div>
    </div>
)
```

### 2.5 스타일링 (PlaceDetailPage.css)
```css
.btn-favorite {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background-color: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    z-index: 10;
}

.btn-favorite i {
    font-size: 1.5rem;
    color: #ccc;
    transition: color 0.2s ease;
}

.btn-favorite:hover {
    transform: scale(1.1);
    background-color: white;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
}

.btn-favorite:hover i {
    color: #ff4b4b;
}

.btn-favorite.active i {
    color: #ff4b4b;
}
```

## 3. 주요 기능 설명

1. **즐겨찾기 상태 확인**
   - 페이지 로드 시 자동으로 확인
   - 로그인 상태 변경 시 자동으로 확인
   - 백엔드 API를 통해 실제 데이터 확인

2. **즐겨찾기 토글**
   - 로그인 체크
   - 백엔드 API 호출
   - 상태 업데이트 및 사용자 피드백

3. **UI/UX**
   - 이미지 우측 상단에 하트 버튼 배치
   - 호버 효과로 사용자 상호작용 강화
   - 즉각적인 상태 변경 피드백

## 4. 에러 처리

1. **로그인 관련**
   - 로그인하지 않은 상태에서 클릭 시 로그인 페이지로 이동
   - localStorage에서 userId 없을 때 처리

2. **API 에러**
   - API 호출 실패 시 에러 로깅
   - 사용자에게 적절한 에러 메시지 표시
   - 기본 상태로 폴백

## 5. 개선 사항

1. **성능**
   - 불필요한 API 호출 최소화
   - 상태 관리 최적화

2. **사용자 경험**
   - 로딩 상태 표시
   - 애니메이션 효과
   - 더 명확한 피드백

3. **코드 품질**
   - 컴포넌트 분리
   - 에러 처리 강화
   - 타입 체크 추가 