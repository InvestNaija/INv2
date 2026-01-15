import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'client';
  ngxEnv = import.meta.env['NG_APP_ENV'];
  supabaseUrl = import.meta.env.NG_APP_PUBLIC_SUPABASE_URL;
  supabaseKey = import.meta.env['NG_APP_PUBLIC_SUPABASE_ANON_KEY'];



  ngOnInit(): void {

  }
}
