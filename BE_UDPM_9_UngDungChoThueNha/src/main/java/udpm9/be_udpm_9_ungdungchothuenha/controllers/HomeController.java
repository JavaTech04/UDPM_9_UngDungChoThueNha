/*
 * Author: Nong Hoang Vu || JavaTech
 * Facebook:https://facebook.com/NongHoangVu04
 * Github: https://github.com/JavaTech04
 * Youtube: https://www.youtube.com/@javatech04/?sub_confirmation=1
 */
package udpm9.be_udpm_9_ungdungchothuenha.controllers;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import udpm9.be_udpm_9_ungdungchothuenha.dto.response.ResponseData;
import udpm9.be_udpm_9_ungdungchothuenha.services.HomeService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/home")
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class HomeController {
    HomeService homeService;

    @GetMapping
    public ResponseData<?> home() {
        return new ResponseData<>(HttpStatus.OK.value(), "GET | 200", this.homeService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseData<?> homeById(@PathVariable long id) {
        return new ResponseData<>(HttpStatus.OK.value(), "GET | 200", this.homeService.get(id));
    }
}
