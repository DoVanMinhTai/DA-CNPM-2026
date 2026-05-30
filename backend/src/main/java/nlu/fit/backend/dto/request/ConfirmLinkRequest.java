package nlu.fit.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmLinkRequest {

    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required to link accounts")
    private String password;

    @NotBlank(message = "OAuth provider is required")
    private String provider;

    @NotBlank(message = "OAuth provider ID is required")
    private String providerId;

    private String providerEmail;
    private String providerName;
    private String avatarUrl;
}
