package nlu.fit.backend.repository;

import nlu.fit.backend.entity.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InterviewQuestionRepository extends JpaRepository<InterviewQuestion, UUID> {

    /**
     * Find all interview question sets for a specific CV, ordered by creation date descending.
     */
    List<InterviewQuestion> findByCvIdOrderByCreatedAtDesc(UUID cvId);

    /**
     * Find all interview question sets for a specific CV and user (via CV ownership).
     */
    List<InterviewQuestion> findByCvUserIdOrderByCreatedAtDesc(UUID userId);
}
