package nlu.fit.backend.dto.mapper;

import nlu.fit.backend.dto.response.UserResponse;
import nlu.fit.backend.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "role", expression = "java(user.getRole() != null ? user.getRole().name() : null)")
    UserResponse toUserResponse(User user);
}
