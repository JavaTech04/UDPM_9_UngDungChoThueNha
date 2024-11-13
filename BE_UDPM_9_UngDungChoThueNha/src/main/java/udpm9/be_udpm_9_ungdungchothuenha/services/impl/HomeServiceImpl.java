/*
 * Author: Nong Hoang Vu || JavaTech
 * Facebook:https://facebook.com/NongHoangVu04
 * Github: https://github.com/JavaTech04
 * Youtube: https://www.youtube.com/@javatech04/?sub_confirmation=1
 */
package udpm9.be_udpm_9_ungdungchothuenha.services.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import udpm9.be_udpm_9_ungdungchothuenha.dto.response.HomeResponse;
import udpm9.be_udpm_9_ungdungchothuenha.models.AbstractEntity;
import udpm9.be_udpm_9_ungdungchothuenha.models.Home;
import udpm9.be_udpm_9_ungdungchothuenha.repositories.HomeRepository;
import udpm9.be_udpm_9_ungdungchothuenha.services.HomeService;

import java.util.HashMap;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class HomeServiceImpl implements HomeService {

    HomeRepository homeRepository;

    @Override
    public HashMap<Long, HomeResponse.Home> test() {
        return new HashMap<>(this.homeRepository.findAll().stream().collect(Collectors.toMap(
                AbstractEntity::getId,
                value -> HomeResponse.Home.builder()
                        .id(value.getId())
                        .price(value.getPrice())
                        .address(value.getAddress())
                        .quantity(value.getQuantity())
                        .imageUrl(value.getImageUrl())
                        .build()
        )));
    }

    @Override
    public Set<HomeResponse.Home> getAll() {
        return this.homeRepository.findAll().stream().map(value -> HomeResponse.Home.builder()
                .id(value.getId())
                .price(value.getPrice())
                .address(value.getAddress())
                .quantity(value.getQuantity())
                .imageUrl(value.getImageUrl())
                .userId(value.getUser().getId())
                .build()).collect(Collectors.toSet());
    }

    @Override
    public HomeResponse.Home get(Long id) {
        Home home = this.homeRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Invalid id: " + id));
        return HomeResponse.Home.builder()
                .id(home.getId())
                .price(home.getPrice())
                .address(home.getAddress())
                .quantity(home.getQuantity())
                .imageUrl(home.getImageUrl())
                .userId(home.getUser().getId()).build();
    }
}
