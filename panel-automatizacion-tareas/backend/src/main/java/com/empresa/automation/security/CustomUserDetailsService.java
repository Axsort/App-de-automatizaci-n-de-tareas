package com.empresa.automation.security;

import com.empresa.automation.entity.User;
import com.empresa.automation.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmailIgnoreCaseAndNotDeleted(email.trim())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        return new UserPrincipal(user);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long id) {
        User user = userRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
        return new UserPrincipal(user);
    }
}
