package nlu.fit.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CvContentDto {
    private PersonalInfo personalInfo = new PersonalInfo();
    private String summary = "";
    private List<Experience> experience = new ArrayList<>();
    private List<Education> education = new ArrayList<>();
    private List<String> skills = new ArrayList<>();
    private List<Project> projects = new ArrayList<>();
    private List<Certification> certifications = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PersonalInfo {
        private String fullName = "";
        private String email = "";
        private String phone = "";
        private String location = "";
        private String linkedin = "";
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Experience {
        private String role = "";
        private String company = "";
        private String period = "";
        private List<String> bullets = new ArrayList<>();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Education {
        private String degree = "";
        private String school = "";
        private String year = "";
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Project {
        private String name = "";
        private String description = "";
        private List<String> technologies = new ArrayList<>();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Certification {
        private String name = "";
        private String issuer = "";
        private String year = "";
    }
}
