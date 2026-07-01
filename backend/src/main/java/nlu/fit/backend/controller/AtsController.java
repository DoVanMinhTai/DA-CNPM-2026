package nlu.fit.backend.controller;

import lombok.RequiredArgsConstructor;
import nlu.fit.backend.dto.request.AtsRequest;
import nlu.fit.backend.dto.response.AtsEvaluationResult;
import nlu.fit.backend.service.AtsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ats")
@RequiredArgsConstructor
public class AtsController {

    private final AtsService atsService;


    @PostMapping("/score")
    public ResponseEntity<AtsEvaluationResult> scoreCv(@RequestBody AtsRequest request) {
        AtsEvaluationResult result = atsService.scoreCvAgainstJd(request.getCvData(), request.getJobDescription());
        return ResponseEntity.ok(result);
    }
}