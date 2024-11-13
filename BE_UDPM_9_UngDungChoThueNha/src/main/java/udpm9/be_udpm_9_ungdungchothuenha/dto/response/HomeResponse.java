/*
 * Author: Nong Hoang Vu || JavaTech
 * Facebook:https://facebook.com/NongHoangVu04
 * Github: https://github.com/JavaTech04
 * Youtube: https://www.youtube.com/@javatech04/?sub_confirmation=1
 */
package udpm9.be_udpm_9_ungdungchothuenha.dto.response;

import lombok.Builder;
import lombok.Getter;

public abstract class HomeResponse {
    @Getter
    @Builder
    public static class Home {
        private long id;

        private String address;

        private Long price;

        private Integer quantity;

        private String imageUrl;

        private Integer userId;

    }
}
