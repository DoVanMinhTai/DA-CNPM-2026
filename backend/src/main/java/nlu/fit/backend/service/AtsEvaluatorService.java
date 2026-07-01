package nlu.fit.backend.service;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;
import nlu.fit.backend.dto.response.AtsEvaluationResult;

public interface AtsEvaluatorService {

    @SystemMessage("""
        Bạn là một chuyên gia tối ưu hóa CV và hệ thống ATS (Applicant Tracking System) cao cấp. 
        Nhiệm vụ của bạn là phân tích sâu cấu trúc dữ liệu JSON của CV và đối chiếu với Mô tả công việc (Job Description - JD) được cung cấp.
        Hãy tính toán điểm số (0-100) dựa trên độ phù hợp về kỹ năng, kinh nghiệm, dự án và đưa ra các nhận xét mang tính xây dựng.
        """)
    @UserMessage("""
        Hãy chấm điểm CV dựa trên JD sau đây:
        
        [Mô tả công việc (JD)]:
        {{jd}}
        
        [Dữ liệu JSON của CV]:
        {{cvJson}}
        """)
    AtsEvaluationResult evaluateCv(@V("cvJson") String cvJson, @V("jd") String jd);
}