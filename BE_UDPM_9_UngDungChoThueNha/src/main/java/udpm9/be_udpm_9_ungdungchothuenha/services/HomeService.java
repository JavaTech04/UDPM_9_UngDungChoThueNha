/*
 * Author: Nong Hoang Vu || JavaTech
 * Facebook:https://facebook.com/NongHoangVu04
 * Github: https://github.com/JavaTech04
 * Youtube: https://www.youtube.com/@javatech04/?sub_confirmation=1
 */
package udpm9.be_udpm_9_ungdungchothuenha.services;

import udpm9.be_udpm_9_ungdungchothuenha.dto.response.HomeResponse;

import java.util.HashMap;
import java.util.Set;

public interface HomeService {
    HashMap<Long, HomeResponse.Home> test();

    Set<HomeResponse.Home> getAll();

    HomeResponse.Home get(Long id);
}
