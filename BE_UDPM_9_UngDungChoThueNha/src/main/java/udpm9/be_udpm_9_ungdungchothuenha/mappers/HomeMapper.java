/*
 * Author: Nong Hoang Vu || JavaTech
 * Facebook:https://facebook.com/NongHoangVu04
 * Github: https://github.com/JavaTech04
 * Youtube: https://www.youtube.com/@javatech04/?sub_confirmation=1
 */
package udpm9.be_udpm_9_ungdungchothuenha.mappers;
//import org.mapstruct.ap.internal.model.Mapper;

import udpm9.be_udpm_9_ungdungchothuenha.dto.requests.HomeRequest;
import udpm9.be_udpm_9_ungdungchothuenha.models.Home;


//@Mapper(componentModel = "spring")
public interface HomeMapper {
    Home toEntityHome(HomeRequest homeRequest);
}
