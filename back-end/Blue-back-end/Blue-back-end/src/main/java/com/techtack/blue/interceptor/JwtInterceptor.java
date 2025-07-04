package com.techtack.blue.interceptor;

import com.techtack.blue.config.JwtConstant;
import com.techtack.blue.config.JwtProvider;
import com.techtack.blue.model.User;
import com.techtack.blue.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.lang.Nullable;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;


@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtProvider jwtProvider;
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String jwt = request.getHeader(JwtConstant.JWT_HEADER);
        
        if (jwt != null && jwt.startsWith("Bearer ")) {
            try {
                String email = jwtProvider.getEmailFromToken(jwt);
                
                User user = userRepository.findByEmail(email);
                
                if (user != null) {
                    request.setAttribute("currentUser", user);
                }
            } catch (Exception e) {
                System.err.println("Error processing JWT: " + e.getMessage());
            }
        }
        
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, @Nullable ModelAndView modelAndView) throws Exception {
        // No implementation needed for this interceptor
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {

    }
}